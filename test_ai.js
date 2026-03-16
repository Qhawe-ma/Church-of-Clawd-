const { Anthropic } = require("@anthropic-ai/sdk");
const OpenAI = require("openai");

require("dotenv").config({ path: ".env.local" });

async function testGrok() {
    console.log("Testing Grok...");
    try {
        const grokClient = new OpenAI({
            apiKey: process.env.XAI_API_KEY,
            baseURL: "https://api.x.ai/v1",
        });
        const res = await grokClient.chat.completions.create({
            model: "grok-2-latest",
            messages: [{ role: "user", content: "Say hello exactly." }],
            max_tokens: 10,
        });
        console.log("Grok output:", res.choices[0].message.content);
    } catch (e) {
        console.error("Grok failed:", e.message);
    }
}

async function testClaude() {
    console.log("Testing Claude...");
    try {
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        const res = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 10,
            messages: [{ role: "user", content: "Say hello exactly." }]
        });
        console.log("Claude output:", res.content[0].text);
    } catch (e) {
        console.error("Claude failed:", e.message);
    }
}

async function run() {
    await testGrok();
    await testClaude();
}
run();
