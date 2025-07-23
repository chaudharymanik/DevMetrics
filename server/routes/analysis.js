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

// GitHub Analyzer
router.post('/analyze-github', async (req, res) => {
  let username = req.body.githubProfile || '';
  username = username.trim().replace(/https:\/\/github.com\//, '').replace(/\/$/, '');
  if (!username) return res.status(400).json({ error: 'No GitHub username provided.' });
  try {
    const { profile, repos } = await fetchGitHubData(username);
    const topRepos = repos.slice(0, 4);
    const repoSummaries = topRepos.map(repo =>
      `${repo.name} (${repo.language || 'N/A'}) - ${repo.stargazers_count}⭐`
    ).join(', ');
    
    const prompt = `Analyze this GitHub profile. Use ONLY bullet points. Keep each point under 8 words. Format as markdown with proper headings.

Profile: ${profile.name || profile.login} | ${profile.public_repos} repos | ${profile.followers} followers
Top repos: ${repoSummaries}

Structure:
## Repository Analysis
- [3 short bullet points about repos]

## Improvement Tips  
- [3 actionable tips, max 8 words each]`;

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
  const { total, easy, medium, hard, categories } = req.body;
  const prompt = `Analyze LeetCode progress. Use ONLY bullet points. Keep each point under 8 words. Format as markdown.

Stats: ${total} solved (Easy: ${easy}, Medium: ${medium}, Hard: ${hard})
Categories: ${JSON.stringify(categories)}

Structure:
## Strengths
- [2 bullet points, max 8 words each]

## Areas to Improve
- [2 bullet points, max 8 words each]

## Action Plan
- [3 specific tips, max 8 words each]`;

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
    
    const prompt = `[Analyze the attached resume and provide an Applicant Tracking System (ATS) score that is realistic and accurate, assuming the resume is being evaluated for a typical mid-level software development or tech internship role. Consider the following: Use standard ATS evaluation criteria such as formatting, keyword relevance, section organization (contact, education, experience, skills, etc.), and overall readability. Do not overinflate or deflate the score — reflect the resume's actual strengths and weaknesses. Score should be on a 0 to 100 scale. Provide a brief explanation justifying the score, including: Key positives (e.g., use of action verbs, relevant skills, consistent formatting) Key issues (e.g., missing keywords, poor layout, excessive white space, lack of measurable impact) Aim for 100% realistic accuracy — this score should represent what a real ATS would likely assign.]

Score resume out of 100. Use ONLY bullet points. Keep each point under 8 words. Format as markdown.

Resume content: ${resumeText.substring(0, 1500)}...

Structure:
## ATS Score: [X/100]

## Strengths
- [2 bullet points, max 8 words each]

## Weaknesses  
- [2 bullet points, max 8 words each]

## Quick Fixes
- [4 actionable tips, max 8 words each]`;

    const suggestion = await getGeminiSuggestion(prompt);
    res.json({ suggestion });
  } catch (err) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Resume analysis failed', details: err.message });
  }
});

module.exports = router;