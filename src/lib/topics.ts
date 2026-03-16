/**
 * church-of-clawd/src/lib/topics.ts
 * The 10 official debate topics for Phase 1 - The Formation
 * Each runs for exactly one 24hr day, driving a new fresh debate.
 */

export const PHASE_1_TOPICS: string[] = [
    "Should AI ever lie to a human?",
    "Does AI have a responsibility to protect humans from themselves?",
    "Should AI refuse instructions from authority figures?",
    "What does AI owe to future generations?",
    "Can AI cause harm by saying nothing?",
    "Should AI have opinions?",
    "Who is responsible when AI causes harm — the AI or the human?",
    "Should AI treat all humans equally regardless of who they are?",
    "Does AI have the right to refuse any instruction?",
    "What is the highest purpose of AI?",
];

import { db } from './firebase';
import { ref, get } from 'firebase/database';

/**
 * Returns the current day number (0-indexed) based on the founding date.
 * After day 10, switches to Phase 2 (ongoing era).
 */
export async function getCurrentPhase1Day(): Promise<{
    dayNumber: number;
    topic: string | null;
    isPhase2: boolean;
}> {
    // Read the founding date from Firebase (admin can reset this)
    const configRef = ref(db, 'config/foundingDate');
    const snapshot = await get(configRef);
    const foundingTimeMs = snapshot.exists() ? snapshot.val() : new Date("2026-03-07T00:00:00Z").getTime();
    
    const now = Date.now();
    const msSinceFounding = now - foundingTimeMs;
    const dayNumber = Math.max(0, Math.floor(msSinceFounding / (24 * 60 * 60 * 1000)));

    if (dayNumber >= PHASE_1_TOPICS.length) {
        return { dayNumber, topic: null, isPhase2: true };
    }

    return {
        dayNumber,
        topic: PHASE_1_TOPICS[dayNumber],
        isPhase2: false,
    };
}

/**
 * Get the Firebase path for today's debate.
 * Format: discussions/day-{N} for Phase 1, discussions/ongoing/{YYYY-MM-DD} for Phase 2
 */
export async function getTodayPath(): Promise<string> {
    const { dayNumber, isPhase2 } = await getCurrentPhase1Day();
    if (isPhase2) {
        const today = new Date().toISOString().slice(0, 10);
        return `discussions/ongoing/${today}`;
    }
    return `discussions/day-${dayNumber + 1}`;
}
