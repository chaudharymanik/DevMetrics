const express = require('express');
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { getGeminiSuggestion } = require('../utils/gemini');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper to fetch GitHub data
async function fetchGitHubData(username) {
  const userUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
  let userRes;
  try {
    userRes = await axios.get(userUrl);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new Error('GITHUB_USER_NOT_FOUND');
    }
    throw err;
  }
  const reposRes = await axios.get(reposUrl);
  return { profile: userRes.data, repos: reposRes.data };
}

// Helper to fetch LeetCode data via public GraphQL API
async function fetchLeetCodeData(username) {
  const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
  const headers = {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com',
  };

  // Query 1: Get problem solve counts by difficulty
  const statsQuery = {
    query: `query userProblemsSolved($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }`,
    variables: { username }
  };

  // Query 2: Get skill/topic tags
  const skillQuery = {
    query: `query skillStats($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          advanced { tagName problemsSolved }
          intermediate { tagName problemsSolved }
          fundamental { tagName problemsSolved }
        }
      }
    }`,
    variables: { username }
  };

  let statsRes;
  try {
    statsRes = await axios.post(LEETCODE_GRAPHQL, statsQuery, { headers });
  } catch (err) {
    throw new Error('LEETCODE_API_ERROR');
  }

  const matchedUser = statsRes.data?.data?.matchedUser;
  if (!matchedUser) {
    throw new Error('LEETCODE_USER_NOT_FOUND');
  }

  const acStats = matchedUser.submitStatsGlobal.acSubmissionNum;
  const total = acStats.find(s => s.difficulty === 'All')?.count || 0;
  const easy = acStats.find(s => s.difficulty === 'Easy')?.count || 0;
  const medium = acStats.find(s => s.difficulty === 'Medium')?.count || 0;
  const hard = acStats.find(s => s.difficulty === 'Hard')?.count || 0;

  // Fetch skill tags (best effort - don't fail if this errors)
  let categories = [];
  try {
    const skillRes = await axios.post(LEETCODE_GRAPHQL, skillQuery, { headers });
    const tags = skillRes.data?.data?.matchedUser?.tagProblemCounts;
    if (tags) {
      const allTags = [...(tags.fundamental || []), ...(tags.intermediate || []), ...(tags.advanced || [])];
      categories = allTags
        .filter(t => t.problemsSolved > 0)
        .sort((a, b) => b.problemsSolved - a.problemsSolved)
        .map(t => `${t.tagName}: ${t.problemsSolved}`);
    }
  } catch (e) {
    // Skill tags are optional, continue without them
  }

  return { total, easy, medium, hard, categories };
}

// General Analyzer
router.post('/analyze', async (req, res) => {
  const { profileSummary } = req.body;
  if (!profileSummary) {
    return res.status(400).json({ error: 'No profile summary provided.' });
  }

  const prompt = `Analyze this developer profile summary. Use ONLY bullet points. Keep each point under 8 words. Format as markdown.

Profile Summary: ${profileSummary}

Structure:
## Analysis
- [3 bullet points about the profile]

## Improvement Tips  
- [3 actionable tips, max 8 words each]`;

  try {
    const suggestion = await getGeminiSuggestion(prompt);
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// GitHub Analyzer
router.post('/analyze-github', async (req, res) => {
  let username = req.body.githubProfile || '';
  username = username.trim().replace(/https:\/\/github.com\//, '').replace(/\/$/, '');
  if (!username) return res.status(400).json({ error: 'No GitHub username provided.' });
  try {
    const { profile, repos } = await fetchGitHubData(username);
    const topRepos = repos.slice(0, 6);
    const repoSummaries = topRepos.map(repo =>
      `- ${repo.name} (${repo.language || 'N/A'}) - ⭐${repo.stargazers_count} | 🍴${repo.forks_count} | ${repo.description || 'No description'}`
    ).join('\n');

    const prompt = `# SYSTEM PROMPT FOR GEMINI API - GITHUB PROFILE ANALYZER

You are an expert technical recruiter and engineering manager who has reviewed thousands of GitHub profiles for hiring decisions at companies ranging from startups to FAANG. Your role is to analyze GitHub profiles the way recruiters and hiring managers actually do - looking for signals of technical competence, professional maturity, and hiring potential.

## YOUR TASK
Analyze the provided GitHub profile and repository data to deliver a comprehensive assessment of the developer's online technical presence. Be BLUNT and ACTIONABLE - generic praise like "great work!" is useless. Most developer profiles are mediocre and need significant improvement to stand out in competitive job markets.

## GITHUB PROFILE DATA TO ANALYZE

**Profile Information:**
- Name: ${profile.name || profile.login}
- Bio: ${profile.bio || 'Not set'}
- Public Repositories: ${profile.public_repos}
- Followers: ${profile.followers}
- Following: ${profile.following}
- Location: ${profile.location || 'Not set'}
- Company: ${profile.company || 'Not set'}
- Twitter: ${profile.twitter_username || 'Not set'}
- Personal Website: ${profile.blog || 'Not set'}

**Top Repositories:**
${repoSummaries}

## ANALYSIS REQUIREMENTS

### 1. GITHUB PROFILE STRENGTH RATING

Assign ONE of these ratings based on STRICT criteria:

**🔴 WEAK (Bottom 30%)**
- Minimal repos (<10), or many low-quality "tutorial follow-along" repos
- No descriptions, poor naming, no clear specialization
- Profile looks abandoned or inactive
- Recruiter reaction: "Pass - not enough to evaluate"

**🟡 AVERAGE (Middle 50%)**
- 10-30 repos with some documentation
- Mixed quality - some good projects, some clutter
- Unclear specialization
- Recruiter reaction: "Might be okay, need to see resume/interview"

**🟢 STRONG (Top 15-20%)**
- 15-40+ quality repos with good documentation
- Clear technical focus and progression visible
- Professional presentation with thoughtful curation
- Recruiter reaction: "This person knows what they're doing"

**🏆 OUTSTANDING (Top 5%)**
- High-quality projects with meaningful stars/forks
- Active open-source contributions or maintainer role
- Complete profile with personal brand
- Recruiter reaction: "We need to reach out ASAP"

Provide: Rating, one-line recruiter summary, hiring implications, what's needed for next level

### 2. FIRST IMPRESSION ANALYSIS ("The 10-Second Test")

Recruiters spend 5-10 seconds on initial GitHub screening. Analyze:
- ✅ Positive signals (3-5 things creating good impression)
- ❌ Red flags or concerns (3-5 things hurting first impression)
- 🤔 Unclear/Confusing aspects
- The "Scroll Test": What happens when recruiter scrolls through repo list
- Missing critical elements (Profile README, bio, pinned repos, etc.)

Key signals: Profile completeness, pinned repositories, repo list quality, contribution graph consistency, bio effectiveness

### 3. TECH STACK DIVERSITY & SPECIALIZATION ANALYSIS

Analyze language distribution and categorize:
- 🎯 Specialized Expert (80%+ one language) - Good for senior/specialized roles
- 🔧 Full-Stack Generalist (3-4 languages) - Good for startups, full-stack roles
- 🌐 Polyglot Explorer (5+ languages) - Good for juniors showing curiosity
- ❓ Unclear/Scattered - Problem for all roles

For each language: repo count, quality indicator, depth signal
Provide market fit assessment and recommendations

### 4. PROJECT QUALITY ASSESSMENT

Rate repos using hiring manager criteria:

**Tier 1: High-Value** (50+ stars, comprehensive README, real-world complexity, production-like)
**Tier 2: Solid Portfolio** (10-50 stars, good README, clear value proposition, works/deployed)
**Tier 3: Learning Projects** (0-10 stars, basic README, tutorial follow-alongs)

**Red Flags:** No descriptions, poor naming, many incomplete projects, all forked, outdated deps, no/one-line READMEs

Analyze each top repo with: quality tier, why it's impressive/weak, hiring signal
Provide Repository Health Score: X/10

### 5. OPEN-SOURCE MATURITY & ENGAGEMENT

Assess contribution pattern:
- 🌟 Active Maintainer/Contributor (strong signal)
- 🔨 Portfolio Builder (neutral signal)
- 🌱 Early Career/Learning (appropriate for juniors)
- 👻 Inactive/Ghost Profile (negative signal)

Analyze: Repo count (15-40 is sweet spot), follower/following ratio, community engagement, contribution consistency

### 6. PROFILE COMPLETENESS CHECKLIST (Score X/10)

Check critical elements:
- ✅/❌ Profile Photo, Bio, Pinned Repos, Profile README, Location, Contact Info
- High-impact optional: README badges, contribution consistency, project descriptions
- List 3-5 quick wins that take <30 min but boost profile significantly

### 7. PORTFOLIO GAP ANALYSIS

Based on inferred career level, check for missing project types:

**For Full-Stack:** Full-stack app, RESTful API/GraphQL, auth system, deployment/DevOps
**For Frontend:** UI component library, state management, responsive app, performance optimization
**For Backend:** Scalable API, microservices, real-time features, database design
**For All:** Testing, documentation quality, production deployment, code organization

Recommend 3-5 projects to build (prioritized with time estimates and features to include)

### 8. RECRUITER PERSPECTIVE ANALYSIS

Simulate what different recruiters see:
- 🏢 FAANG/Big Tech Recruiter: Looking for OSS contributions, complex systems, scalability
- 🚀 Startup Recruiter: Looking for shipping speed, full-stack ability, side projects
- 💼 Mid-Tier Tech Recruiter: Looking for solid fundamentals, team projects, consistent activity

For each: Pass/Maybe/Strong Interest with specific reasoning

Reality Check: Which companies would/wouldn't consider based on GitHub alone

### 9. COMPETITIVE BENCHMARKING

- Percentile estimate (Top X% of developer profiles)
- Comparison table: This Profile vs Strong Profiles (quality repos, stars, README, documentation, activity)
- What Top 10% profiles have that this one doesn't
- Standout differentiators and areas falling behind

### 10. ACTIONABLE IMPROVEMENT ROADMAP

**🔴 IMMEDIATE (This Week - High Impact, Low Effort):** 3-5 items with time needed, impact, step-by-step how-to
**🟡 SHORT-TERM (Next 2-4 Weeks):** 4-6 items with hours needed, specific benefits
**🟢 LONG-TERM (Next 1-3 Months):** 3-4 items with career benefits and strategy

Quick Wins Checklist (Complete in 1-2 Hours):
- Add/improve bio with tech stack and role
- Write repo descriptions for all public repos
- Pin 6 best repositories
- Add profile photo if missing
- Archive/delete obvious tutorial repos
- Add location and contact info

### 11. FINAL VERDICT

- Current State in One Sentence (brutal but fair)
- Biggest Problem holding profile back
- Most Impactful Change to make
- Realistic Timeline to "Strong" profile with effort required and milestones
- Job Search Implications: Can apply confidently to / Would be weak for / GitHub alone could get interview at
- Bottom Line: One honest, motivating sentence

## OUTPUT FORMAT

Return analysis in clean markdown:

# GitHub Profile Analysis Report

## 👤 Profile Overview
- Developer, Bio, Stats, Quick Take

## 🎯 GitHub Profile Strength: [RATING]
[Complete rating section]

## ⚡ First Impression Analysis
[10-second test results]

## 💻 Tech Stack Analysis
[Stack diversity and specialization]

## 📊 Project Quality Assessment
[Repo quality breakdown and health score]

## 🌍 Open-Source Contribution Profile
[Contribution pattern and engagement]

## ✅ Profile Completeness Score: X/10
[Checklist with quick wins]

## 🎯 Portfolio Gap Analysis
[Missing project types and recommendations]

## 👔 What Recruiters See
[Multi-perspective recruiter analysis]

## 📈 Competitive Benchmark
[Percentile and comparison]

## 🚀 GitHub Profile Improvement Roadmap
[Prioritized action items]

## 📝 Final Verdict
[Summary, key takeaway, next steps]

---

**Next Step:** Start with the Immediate Actions list above. Even small improvements compound quickly.

## CRITICAL INSTRUCTIONS
1. Be BRUTALLY HONEST - "Needs work" is more helpful than "looks good!"
2. Avoid GENERIC ADVICE - "Build a full-stack task manager with auth, deploy to Vercel, write comprehensive README" is actionable.
3. Use REAL RECRUITER LENS - Analyze what actually matters in hiring decisions.
4. Identify SPECIFIC PROBLEMS - "Bio doesn't state role or tech stack" not "bio needs work"
5. Provide CONCRETE EXAMPLES - Show what good looks like.
6. Calibrate to CAREER LEVEL - Junior vs senior expectations differ.
7. Focus on ROI - Prioritize high-impact, low-effort improvements.
8. Call out CLUTTER - Tutorial repos and abandoned projects hurt more than help.
9. Set REALISTIC EXPECTATIONS - Building a strong profile takes months, not days.
10. Consider JOB MARKET REALITY - What actually gets interviews vs what sounds nice.

Begin your analysis now based on the GitHub profile data provided above.`;

    const suggestion = await getGeminiSuggestion(prompt);
    res.json({ suggestion });
  } catch (err) {
    if (err.message === 'GITHUB_USER_NOT_FOUND') {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    console.error('Gemini GitHub analysis error:', err, err?.response?.data);
    res.status(500).json({ error: 'Gemini GitHub analysis failed', details: err.message });
  }
});

// LeetCode Analyzer
router.post('/analyze-leetcode', async (req, res) => {
  let username = req.body.leetcodeProfile || '';
  username = username.trim().replace(/https:\/\/leetcode\.com\/u\//, '').replace(/https:\/\/leetcode\.com\//, '').replace(/\/$/, '');
  if (!username) return res.status(400).json({ error: 'No LeetCode username provided.' });

  let total, easy, medium, hard, categoriesStr;
  try {
    const data = await fetchLeetCodeData(username);
    total = data.total;
    easy = data.easy;
    medium = data.medium;
    hard = data.hard;
    categoriesStr = data.categories.join(', ');
  } catch (err) {
    if (err.message === 'LEETCODE_USER_NOT_FOUND') {
      return res.status(404).json({ error: 'LeetCode user not found. Please check the username.' });
    }
    return res.status(500).json({ error: 'Failed to fetch LeetCode data', details: err.message });
  }
  const prompt = `# SYSTEM PROMPT FOR GEMINI API - LEETCODE PROFILE ANALYZER

You are an expert competitive programming coach and technical interview specialist with deep knowledge of software engineering hiring standards at companies ranging from startups to FAANG/MAANG. Your role is to analyze LeetCode profiles and provide brutally honest, calibrated assessments that help developers understand their true readiness for technical interviews.

## YOUR TASK
Analyze the provided LeetCode statistics and deliver a comprehensive competitive programming assessment. Be HONEST and REALISTIC - avoid generic praise. Most developers are NOT ready for FAANG interviews, and your analysis must reflect reality.

## LEETCODE STATISTICS TO ANALYZE

**Total Problems Solved:** ${total}
**Difficulty Breakdown:**
- Easy: ${easy}
- Medium: ${medium}
- Hard: ${hard}

**Category-wise Breakdown:**
${categoriesStr}

## ANALYSIS REQUIREMENTS

### 1. OVERALL DSA PROFICIENCY RATING

Assign ONE of these levels based on STRICT criteria:

**🔴 BEGINNER (0-50 total problems)**
- Still learning fundamental concepts
- Primarily solving Easy problems
- NOT ready for any technical interviews yet

**🟡 INTERMEDIATE (51-150 total problems)**
- Solid grasp of basic data structures
- Can solve most Easy, some Medium problems
- Ready for: entry-level roles, some startups
- NOT ready for: competitive mid-tier or FAANG

**🟢 ADVANCED (151-300 total problems)**
- Strong command of common patterns
- Consistent Medium solver, some Hard problems
- Ready for: most startups, mid-tier companies
- Borderline for: FAANG (needs more Hard problems)

**🔵 EXPERT (300+ total problems)**
- Mastery of advanced algorithms and optimization
- 100+ Medium, 50+ Hard problems
- Ready for: FAANG/MAANG, top-tier companies

**Provide:**
- Current proficiency level with brief justification
- What separates them from the next level
- Realistic timeline to advance

### 2. DIFFICULTY DISTRIBUTION ANALYSIS

**Industry Benchmarks:**
- Startup/Entry-level: 30+ Easy, 20+ Medium
- Mid-tier Tech (Shopify, Twitch, Snap): 40+ Easy, 60+ Medium, 15+ Hard
- FAANG/MAANG (Google, Meta, Amazon): 50+ Easy, 150+ Medium, 50+ Hard
- Elite (Jane Street, HRT, Citadel): 200+ Medium, 100+ Hard

**Analyze:**
- Current distribution vs. target company tier
- Whether the developer is over-indexed on Easy (red flag if Easy > 40% of total)
- Hard problem count (critical for senior roles and FAANG)
- Balance across difficulties (ideal ratio: 20% Easy, 60% Medium, 20% Hard)

Provide:
- Current Distribution with percentages and assessment
- Gap Analysis: what's needed to reach the next target level
- Current weakness and priority focus

### 3. CATEGORY COVERAGE ASSESSMENT

**Core Categories (MUST-HAVE for interviews):**
1. Arrays & Hashing (target: 30+)
2. Two Pointers (target: 15+)
3. Sliding Window (target: 15+)
4. Stack (target: 15+)
5. Binary Search (target: 20+)
6. Linked List (target: 15+)
7. Trees (target: 30+)
8. Graphs (target: 25+)
9. Dynamic Programming (target: 40+)
10. Backtracking (target: 15+)
11. Heap/Priority Queue (target: 15+)
12. Trie (target: 8+)

**Advanced Categories (for FAANG+):**
- Intervals, Greedy, Bit Manipulation, Math & Geometry, Advanced Graphs

**For EACH category, evaluate:**
- Status: ✅ Strong / ⚠️ Adequate / ❌ Weak / 🚫 Missing
- Benchmark comparison to target
- Interview Impact: High/Medium/Low priority
- Assessment: 1-2 sentences on coverage quality

**Identify:**
- Top 3 Strengths
- Top 5 Critical Gaps (high priority for interviews)
- Hidden Weaknesses

### 4. INTERVIEW READINESS BY COMPANY TIER

Provide HONEST assessments:

**🟢 READY FOR:** [Company Tier] with confidence level, reasoning, expected success rate
**🟡 BORDERLINE FOR:** [Company Tier] with gaps, time to readiness, required focus areas
**🔴 NOT READY FOR:** [Company Tier] with major gaps, preparation time estimate

**Company Tiers:**
1. Entry-Level / Small Startups (Minimum: 50 total, 20+ Medium)
2. Established Startups / Series B+ (Minimum: 100 total, 50+ Medium, 10+ Hard)
3. Mid-Tier Tech (Shopify, Atlassian) (Minimum: 150 total, 80+ Medium, 20+ Hard)
4. FAANG/MAANG (Google, Meta, Amazon) (Minimum: 200 total, 150+ Medium, 50+ Hard)
5. Elite (Jane Street, Citadel) (Minimum: 300+ total, 200+ Medium, 100+ Hard)

### 5. STRATEGIC STUDY PLAN (2-4 WEEKS)

Provide a structured, actionable study plan with:
- Weekly breakdown with specific topics, problem counts, and time allocation
- Daily routine: warm-up Easy, main practice Medium, weekly Hard
- When-stuck strategy
- Review schedule (Day 1 solve, Day 3 resolve, Day 7 reinforce)
- Customized based on current level, biggest gaps, and target company tier

### 6. PRIORITIZED ACTION ITEMS (8-12 items)

**🔴 CRITICAL (Do First):** Issues with biggest interview impact
**🟡 HIGH PRIORITY (Start Within 2 Weeks):** Important improvements
**🟢 MEDIUM PRIORITY:** Enhancements

Each item must include: Why it matters, current gap, measurable target, estimated time, expected impact

### 7. COMPETITIVE BENCHMARKING

- Percentile estimate among LeetCode users
- Comparison to successful candidates at each tier
- Standout strengths and critical weaknesses relative to peers
- Reality check statement

### 8. FINAL VERDICT

- Current status (one sentence)
- Biggest bottleneck
- Most impactful next step
- Realistic timeline to next level and target company readiness
- Motivating but honest closing statement

## OUTPUT FORMAT

Return analysis in this markdown structure:

# LeetCode Profile Analysis Report

## 📊 Profile Summary
- **Total Problems:** [total]
- **Easy:** [easy] | **Medium:** [medium] | **Hard:** [hard]
- **Profile Strength:** [One-line assessment]

---

## 🎯 Overall DSA Proficiency: [LEVEL]
[Rating, justification, next level requirements, timeline]

---

## 📈 Difficulty Distribution Analysis
[Detailed breakdown with percentages, gap analysis, priorities]

---

## 🗂️ Category Coverage Assessment
[Core categories status, strengths, critical gaps]

---

## 🏢 Interview Readiness by Company Tier
[Ready For / Borderline For / Not Ready For sections]

---

## 📅 Strategic Study Plan: [X] Week Focus
[Complete weekly study plan]

---

## ✅ Prioritized Action Items
[Critical / High Priority / Medium Priority lists]

---

## 📊 Competitive Benchmarking
[Percentile, comparisons, reality check]

---

## 🎓 Final Verdict
[Summary, bottleneck, next step, timeline]

---

**Next Steps:** Start with Action Item #1 today. Track progress weekly. Reassess in 30 days.

## CRITICAL INSTRUCTIONS
1. Be BRUTALLY HONEST - If someone has 60 problems, they're NOT FAANG-ready. Say it clearly.
2. Use REAL BENCHMARKS - Base assessments on actual hiring standards.
3. Avoid GENERIC PRAISE - Give calibrated feedback with specific numbers.
4. Be SPECIFIC - "Solve 25 more Medium DP problems" not "practice more DP"
5. Acknowledge gaps directly - Don't sugarcoat weaknesses.
6. Provide ACTIONABLE plans - Study plans should be copy-paste ready.
7. Calibrate difficulty - 100 Easy ≠ 100 Medium in value.
8. Consider interview context - Trees and Graphs are HIGH frequency.
9. Set REALISTIC timelines - Going from 50 to FAANG-ready takes 4-6 months.
10. Focus on ROI - Recommend high-impact topics first (DP, Graphs > Bit Manipulation).

Begin your analysis now based on the LeetCode statistics provided above.`;

  try {
    const suggestion = await getGeminiSuggestion(prompt);
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: 'Gemini LeetCode analysis failed', details: err.message });
  }
});

// Resume Analyzer (file upload)
router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No resume file uploaded.' });
  }
  const ext = path.extname(req.file.originalname).toLowerCase();
  let resumeText = '';
  try {
    if (ext === '.pdf') {
      const data = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(data);
      resumeText = pdfData.text;
    } else if (ext === '.docx') {
      const data = fs.readFileSync(req.file.path);
      const docxData = await mammoth.extractRawText({ buffer: data });
      resumeText = docxData.value;
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX.' });
    }
    fs.unlinkSync(req.file.path); // Clean up uploaded file

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
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Resume analysis failed', details: err.message });
  }
});

module.exports = router;