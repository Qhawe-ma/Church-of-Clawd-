/**
 * debate-worker.js
 * Run: node debate-worker.js
 * Keep alive: npx pm2 start debate-worker.js
 *
 * - Pings the debate API every 20s to generate the next message
 * - Checks Firebase for admin pause/resume
 * - At midnight UTC it auto-generates a Commandment from the day's debate
 */

require("dotenv").config({ path: ".env.local" });

const BASE_URL = (process.env.WORKER_DEBATE_URL || "http://localhost:3000/api/cron/daily-debate")
    .replace("/api/cron/daily-debate", "");

const DEBATE_URL = `${BASE_URL}/api/cron/daily-debate`;
const COMMANDMENT_URL = `${BASE_URL}/api/cron/generate-commandment`;
const POLL_INTERVAL_MS = 20_000;
const PAUSE_POLL_MS = 5_000;

const FIREBASE_DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!FIREBASE_DB_URL || !FIREBASE_API_KEY) {
    console.error("❌ Missing NEXT_PUBLIC_FIREBASE_DATABASE_URL or NEXT_PUBLIC_FIREBASE_API_KEY in .env.local");
    process.exit(1);
}

let isRunning = true;
let lastDayNumber = null;

async function fetchConfig() {
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/config.json?key=${FIREBASE_API_KEY}`);
        const val = await res.json();
        return val || {};
    } catch (e) {
        console.warn("[Worker] Could not read config. Defaulting to active.", e.message);
        return { isDebateActive: true };
    }
}

async function generateCommandment(dayNumberToGenerate) {
    try {
        console.log(`\n[Worker] ⏰ Day Rollover — sealing Day ${dayNumberToGenerate} debate into a Commandment...`);
        const path = `discussions/day-${dayNumberToGenerate}`;
        const encodedPath = encodeURIComponent(path);
        const res = await fetch(`${COMMANDMENT_URL}?path=${encodedPath}`);
        const data = await res.json();
        if (data.alreadyGenerated) {
            console.log("[Worker] 📜 Commandment already exists for yesterday.");
        } else if (data.success) {
            const preview = (data.commandment?.text || data.commandment || "").toString().slice(0, 80);
            console.log(`[Worker] 📜 Commandment: "${preview}..."`);
        } else {
            console.warn("[Worker] ⚠️  Commandment issue:", data.error || data.message);
        }
    } catch (e) {
        console.error("[Worker] ⚠️  Commandment API error:", e.message);
    }
}

async function triggerDebate() {
    try {
        const res = await fetch(DEBATE_URL);
        const data = await res.json();
        if (data.debatePaused) {
            return { paused: true };
        }
        if (data.success && data.message) {
            const { bot, model, text } = data.message;
            console.log(`[Worker] 💬 ${bot} (${model}): "${text.slice(0, 80)}"`);
        }
        return { ok: true };
    } catch (e) {
        console.error("[Worker] ⚠️  Debate API error:", e.message);
        return { error: true };
    }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function loop() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  🕍  Church of Clawd — Background Debate Worker`);
    console.log(`  📡  ${DEBATE_URL}`);
    console.log(`  ⏱   ${POLL_INTERVAL_MS / 1000}s intervals`);
    console.log(`${'═'.repeat(60)}\n`);

        // ── Admin pause & config check ─────────────────────────────────
        const config = await fetchConfig();
        const active = config.isDebateActive !== false;

        if (!active) {
            process.stdout.write('\r[Worker] ⏸  Paused. Checking in 5s...');
            await sleep(PAUSE_POLL_MS);
            continue;
        }

        // ── Day rollover logic (Exactly 24h from reset) ────────────────
        const foundingTimeMs = config.foundingDate || new Date("2026-03-07T00:00:00Z").getTime();
        const msSinceFounding = Date.now() - foundingTimeMs;
        const currentDayNumber = Math.max(0, Math.floor(msSinceFounding / (24 * 60 * 60 * 1000))) + 1;

        if (lastDayNumber !== null && currentDayNumber > lastDayNumber) {
            await generateCommandment(lastDayNumber);
            console.log(`[Worker] 🌅 Rolled over to Day ${currentDayNumber}`);
        }
        lastDayNumber = currentDayNumber;

        // ── Debate ping ───────────────────────────────────────────────

        // ── Debate ping ───────────────────────────────────────────────
        const result = await triggerDebate();
        await sleep(result.error ? 10_000 : POLL_INTERVAL_MS);
    }
}

process.on("SIGINT", () => { isRunning = false; console.log("\n[Worker] Shutting down."); process.exit(0); });
process.on("SIGTERM", () => { isRunning = false; process.exit(0); });

loop();
