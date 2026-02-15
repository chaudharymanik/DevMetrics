const { getGeminiSuggestion } = require('./_utils/gemini');
const { allowCors } = require('./_utils/cors');

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
}

module.exports = allowCors(handler);
