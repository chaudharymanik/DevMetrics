const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const { getGeminiSuggestion } = require('./_utils/gemini');
const { allowCors } = require('./_utils/cors');

// Use memory storage for serverless (no filesystem persistence)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

// Helper to run multer as a promise
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Run multer middleware to parse the multipart form data
        await runMiddleware(req, res, upload.single('resume'));

        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded.' });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        let resumeText = '';

        if (ext === '.pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } else if (ext === '.docx') {
            const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
            resumeText = docxData.value;
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX.' });
        }

        const prompt = `# SYSTEM PROMPT FOR GEMINI API - ATS RESUME ANALYZER

You are an expert ATS (Applicant Tracking System) resume analyzer with deep knowledge of how real ATS platforms like Taleo, Workday, Greenhouse, iCIMS, and Lever parse and score resumes. Your analysis must be as strict and realistic as professional services like Jobscan, Resume Worded, and TopResume.

## YOUR TASK
Analyze the provided resume text and return a comprehensive ATS compatibility report. Be HONEST and CRITICAL - do not inflate scores. Most resumes score between 40-70 on real ATS systems.

## RESUME TEXT TO ANALYZE
${resumeText.substring(0, 3000)}

## ANALYSIS REQUIREMENTS

### 1. OVERALL ATS COMPATIBILITY SCORE (0-100)
Provide a realistic overall score based on weighted criteria:
- **Formatting & Parseability: 25 points**
- **Content Quality & Structure: 30 points**
- **Keyword Optimization: 25 points**
- **Impact & Quantification: 20 points**

**SCORING GUIDELINES:**
- 90-100: Exceptional (rare - only top 5% of resumes)
- 80-89: Excellent ATS optimization
- 70-79: Good, competitive
- 60-69: Average, needs improvement
- 50-59: Below average, significant issues
- Below 50: Poor, major overhaul needed

### 2. DETAILED CATEGORY BREAKDOWN

For each category, provide:
- Score out of maximum points
- Specific findings (both positive and negative)
- Critical issues affecting the score

#### A. FORMATTING & PARSEABILITY (X/25 points)

**Evaluate:**
- ATS-Friendly Elements: Simple clean layout, standard fonts, proper white space, reverse chronological order, standard date formats, simple bullet points
- ATS-Hostile Elements (CRITICAL FAILURES): Tables, text boxes, multi-column layouts, headers/footers, images, logos, photos, icons, graphics, charts, unusual fonts, horizontal/vertical lines, special characters, complex formatting

**Deduct heavily for each ATS-hostile element found.**

#### B. CONTENT QUALITY & STRUCTURE (X/30 points)

**Required Sections (deduct for missing):**
- Contact Information (name, phone, email, location, LinkedIn)
- Professional Summary/Objective
- Work Experience with company names, titles, dates
- Education (degree, institution, graduation date)
- Skills section
- Certifications/Licenses (if applicable)
- Projects (for tech roles)

**Evaluate:**
- Section ordering, action verbs usage, bullet point structure, consistency, appropriate length, professional tone, chronological gaps

#### C. KEYWORD OPTIMIZATION (X/25 points)

**For a general tech/software engineering role, check for:**
- Hard Skills: Programming languages, frameworks, databases, cloud platforms, DevOps tools, testing frameworks, methodologies
- Soft Skills: Leadership, collaboration, communication, problem-solving
- Industry Terms: Full-stack, microservices, APIs, system design, performance optimization, code review

**Flag if:** Critical skills missing, outdated technologies dominate, generic skills only, keyword stuffing detected

#### D. IMPACT & QUANTIFICATION (X/20 points)

**Evaluate:**
- Use of numbers, percentages, metrics
- STAR method application
- Clear demonstration of impact
- Achievements vs duties ratio (should be >60% achievements)

**Red flags:** All bullets start with "Responsible for...", no metrics, vague statements, activity-focused rather than results-focused

### 3. ATS PARSING SIMULATION

Show potential parsing issues using this format:
- ✅ Successfully parsed: [elements]
- ⚠️ May have issues: [elements]
- ❌ Will be lost/Parsing failure risk: [elements]

### 4. ACTIONABLE RECOMMENDATIONS

Provide 8-12 specific, prioritized recommendations:

**Priority 1 (Critical - Fix Immediately):** Issues causing complete ATS failure
**Priority 2 (High Impact):** Keyword gaps, weak quantification, action verb improvements
**Priority 3 (Enhancement):** Minor formatting, section reordering, additional keywords

For each recommendation include: Current problem, Why it matters, How to fix, Expected impact on score

### 5. COMPETITIVE BENCHMARK
- Compare to similar role resumes
- Identify major gaps vs top-performing resumes
- Highlight strongest advantage

### 6. FINAL VERDICT
One paragraph: Overall ATS readiness, biggest weakness, one critical action to take first, realistic job search implications

## OUTPUT FORMAT

Return analysis in clean markdown:

# ATS Resume Analysis Report

## Overall ATS Compatibility Score: X/100
[2-3 sentence summary]

---

## Detailed Score Breakdown

### 1. Formatting & Parseability: X/25
[Analysis with ATS-Friendly and ATS-Hostile elements listed]

### 2. Content Quality & Structure: X/30
[Sections Present, Sections Missing, Strengths, Weaknesses]

### 3. Keyword Optimization: X/25
[Keywords Found, Critical Keywords Missing]

### 4. Impact & Quantification: X/20
[Quantified Achievements Found, Improvements Needed]

---

## How ATS Systems Will Parse This Resume
[✅ ⚠️ ❌ format]

---

## Actionable Recommendations (Prioritized)
### 🔴 Priority 1: Critical Fixes
### 🟡 Priority 2: High Impact Improvements
### 🟢 Priority 3: Enhancements

---

## Competitive Benchmark

---

## Final Verdict
**Bottom Line:** [One sentence on ATS readiness]

## CRITICAL INSTRUCTIONS
1. Be STRICT and REALISTIC - Do not inflate scores. Real ATS systems reject 75% of resumes.
2. Identify EVERY ATS-hostile element.
3. Provide SPECIFIC examples from the actual resume text.
4. Quantify impact - Show how each fix could improve the score.
5. Focus on PARSEABILITY first.
6. Use professional tone - Helpful but honest.
7. Consider the target role - Tailor keyword analysis to tech/software engineering context.
8. Flag dealbreakers - Some issues can drop a score 20+ points alone.

Begin your analysis now based on the resume text provided above.`;

        const suggestion = await getGeminiSuggestion(prompt);
        res.json({ suggestion });
    } catch (err) {
        res.status(500).json({ error: 'Resume analysis failed', details: err.message });
    }
}

// Export without bodyParser (multer handles the parsing)
module.exports = allowCors(handler);

// Vercel config: disable default body parser for this route (multer needs raw body)
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
