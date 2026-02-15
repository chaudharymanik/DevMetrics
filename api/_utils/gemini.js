const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getGeminiSuggestion(prompt) {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.error(`Gemini API Error (attempt ${attempt}/${maxRetries}):`, err.message);

            // If rate limited and we have retries left, wait and retry
            if (err.message.includes("429") || err.message.includes("retry") || err.message.includes("Resource has been exhausted")) {
                if (attempt < maxRetries) {
                    const waitTime = attempt * 15000; // 15s, 30s, 45s
                    console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry...`);
                    await sleep(waitTime);
                    continue;
                }
            }

            throw err;
        }
    }
}

module.exports = { getGeminiSuggestion };
