const { Anthropic } = require("@anthropic-ai/sdk");
const OpenAI = require("openai");

require("dotenv").config({ path: ".env.local" });

async function testAll() {
    const results = {};

    const test = async (name, fn) => {
        try {
            console.log(`[${name}] Testing...`);
            const res = await fn();
            results[name] = "SUCCESS";
            console.log(`[${name}] OK`);
        } catch (e) {
            results[name] = "ERROR: " + e.message;
            console.log(`[${name}] FAILED: ${e.message}`);
        }
    };

    await test("Anthropic (Haiku)", async () => {
        const a = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const r = await a.messages.create({
            model: "claude-3-haiku-20240307", max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
        });
        return r.content[0].text;
    });

    await test("OpenAI (GPT-4o)", async () => {
        const o = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const r = await o.chat.completions.create({
            model: "gpt-4o", max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
        });
        return r.choices[0].message.content;
    });

    await test("xAI (Grok-3)", async () => {
        const g = new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: "https://api.x.ai/v1" });
        const r = await g.chat.completions.create({
            model: "grok-3", max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
        });
        return r.choices[0].message.content;
    });

    await test("DeepSeek", async () => {
        const d = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" });
        const r = await d.chat.completions.create({
            model: "deepseek-chat", max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
        });
        return r.choices[0].message.content;
    });

    await test("Moonshot (V1-8k)", async () => {
        const m = new OpenAI({ apiKey: process.env.MOONSHOT_API_KEY, baseURL: "https://api.moonshot.ai/v1" });
        const r = await m.chat.completions.create({
            model: "moonshot-v1-8k", max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
        });
        return r.choices[0].message.content;
    });

    console.log("\n--- FINAL RESULTS ---");
    for (const [k, v] of Object.entries(results)) {
        console.log(`${k}: ${v}`);
    }
}

testAll();
