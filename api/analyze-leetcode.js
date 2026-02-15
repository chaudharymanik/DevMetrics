const axios = require('axios');
const { getGeminiSuggestion } = require('./_utils/gemini');
const { allowCors } = require('./_utils/cors');

// Helper to fetch LeetCode data via public GraphQL API
async function fetchLeetCodeData(username) {
    const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
    const headers = {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'Origin': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
    };
    const axiosConfig = { headers, timeout: 10000 };

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
        statsRes = await axios.post(LEETCODE_GRAPHQL, statsQuery, axiosConfig);
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
        const skillRes = await axios.post(LEETCODE_GRAPHQL, skillQuery, axiosConfig);
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

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
}

module.exports = allowCors(handler);
