/**
 * Mission (level) definitions.
 *
 * Titles and hints live in `src/lang/*.json` under `missions.<id>.*`; the drill
 * text itself is NOT translated — it *is* the exercise.
 *
 * Ordering matters: index + 1 is the displayed level number, and clearing a
 * mission unlocks the next one in this array.
 */

import { toCodePoints } from "./khmer";
import type { Script } from "./keyboard";

export interface Mission {
  id: string;
  /** Which script this drill is written in; the concrete key table follows the
   *  learner's Khmer layout preference. */
  script: Script;
  /** Single-emoji badge shown on the mission card. */
  badge: string;
  /** WPM needed for a 3-star clear. */
  targetWpm: number;
  /** One "screen" of text per entry; the hero runs one line at a time. */
  lines: string[];
  /** Custom user-provided title (used instead of i18n lookup). */
  title?: string;
  /** Custom user-provided description or source hint. */
  hint?: string;
  /** True if this is a user-created lesson stored in localStorage. */
  isCustom?: boolean;
  /** Creation timestamp for custom lessons. */
  createdAt?: number;
}

export const MISSIONS: Mission[] = [
  {
    id: "kh-home-row",
    script: "kh",
    badge: "🍄",
    targetWpm: 12,
    lines: [
      "ា ស ដ ថ ង ហ ក ល",
      "កា សា ដា ថា ងា ហា លា",
      "កល សក ដង ថង លា ហា",
      "ដល់ កាល សាល ហាល",
    ],
  },
  {
    id: "kh-consonants",
    script: "kh",
    badge: "🔤",
    targetWpm: 14,
    lines: [
      "ក ខ គ ឃ ង",
      "ច ឆ ជ ឈ ញ",
      "ដ ឋ ឌ ឍ ណ",
      "ត ថ ទ ធ ន",
      "ប ផ ព ភ ម",
      "យ រ ល វ ស ហ ឡ អ",
    ],
  },
  {
    id: "kh-vowels",
    script: "kh",
    badge: "🎵",
    targetWpm: 14,
    lines: [
      "កា កិ កី កឹ កឺ",
      "កុ កូ កួ កើ កឿ",
      "កៀ កេ កែ កៃ កោ",
      "កៅ កំ កះ ក់",
    ],
  },
  {
    id: "kh-coeng",
    script: "kh",
    badge: "🧱",
    targetWpm: 16,
    lines: [
      "ក្ក ខ្ខ គ្គ ង្គ",
      "ច្ច ជ្ជ ត្ត ន្ត",
      "ស្រ ស្ត ស្អ ព្រ",
      "ខ្ញ ភ្ន ម្ន ក្រ",
      "ស្រុក ខ្មែរ ក្រុង ភ្នំ",
    ],
  },
  {
    id: "kh-words",
    script: "kh",
    badge: "🪙",
    targetWpm: 18,
    lines: [
      "ខ្មែរ ភាសា សាលា គ្រូ សិស្ស",
      "ផ្ទះ បាយ ទឹក ចេក ត្រី",
      "ភ្នំពេញ សៀមរាប បាត់ដំបង",
      "ជំរាបសួរ អរគុណ សូម លាហើយ",
      "ស្អាត ល្អ ធំ តូច ញញឹម",
    ],
  },
  {
    id: "kh-sentences",
    script: "kh",
    badge: "📜",
    targetWpm: 20,
    lines: [
      "ខ្ញុំស្រឡាញ់ភាសាខ្មែរ។",
      "តើអ្នកសុខសប្បាយជាទេ។",
      "ថ្ងៃនេះអាកាសធាតុល្អណាស់។",
      "ខ្ញុំចង់ទៅសាលារៀនពេលព្រឹក។",
      "ប្រាសាទអង្គរវត្តនៅសៀមរាប។",
      "សូមអរគុណច្រើនសម្រាប់ជំនួយ។",
    ],
  },
  {
    id: "kh-numerals",
    script: "kh",
    badge: "🔢",
    targetWpm: 16,
    lines: [
      "០ ១ ២ ៣ ៤ ៥ ៦ ៧ ៨ ៩",
      "១០ ២៥ ៩៩ ១០០ ២០២៦",
      "។ ៕ ៖ ៗ ៛",
      "តម្លៃ ៤០០០៛ ។",
    ],
  },
  {
    id: "kh-independent",
    script: "kh",
    badge: "🌿",
    targetWpm: 10,
    // ឨ is deliberately absent: the SBBIC layout has no key for it, and a drill
    // must never ask for a character the learner's keyboard cannot produce.
    lines: [
      "ឥ ឦ ឧ ឩ ឪ",
      "ឫ ឬ ឭ ឮ",
      "ឯ ឰ ឱ ឲ ឳ",
      "ឥឡូវ ឪពុក ឧត្តម",
    ],
  },
  {
    // The Option/AltGr plane. Deliberately last in the Khmer track: these are
    // three- and four-key chords, so they need the earlier missions' muscle
    // memory first.
    id: "kh-symbols",
    script: "kh",
    badge: "⌥",
    targetWpm: 8,
    // Every character here is reachable on BOTH Khmer layouts. The euro sign,
    // + = ; ' and the typographic set (~ ... (c) (r) TM - -- * x) exist only on
    // NiDA, so they are excluded rather than silently unreachable on SBBIC.
    lines: [
      "$ @ * ( )",
      ", . ?",
      "៑ ៙ ៚ ៜ",
      "ឝ ឞ ឩ",
      "៖ ៈ ៕ ៛",
    ],
  },
  {
    id: "en-home-row",
    script: "en",
    badge: "⭐",
    targetWpm: 25,
    lines: [
      "asdf jkl; asdf jkl;",
      "sad lads fall; a flask",
      "dad had a salad; all glad",
      "flash flag half hall",
    ],
  },
  {
    id: "en-words",
    script: "en",
    badge: "🌟",
    targetWpm: 35,
    lines: [
      "the quick brown fox jumps over the lazy dog",
      "power up and level down without a single miss",
      "coins castles pipes and mushrooms",
      "type every letter before the timer runs out",
    ],
  },
  {
    id: "en-speed",
    script: "en",
    badge: "🚀",
    targetWpm: 45,
    lines: [
      "Practice makes progress, not perfection.",
      "Pack my box with five dozen liquor jugs.",
      "How vexingly quick daft zebras jump!",
      "The fastest typist in the mushroom kingdom never looks down.",
    ],
  },
  {
    id: "en-punctuation",
    script: "en",
    badge: "🔣",
    targetWpm: 40,
    lines: [
      '"Look out!" shouted Mario, "Don\'t fall into the pit!"',
      "Practice, patience, and poise: these build true mastery.",
      "Can't you see the flagpole? It's just beyond the castle walls!",
      '"Press Start to begin," read the screen; "Are you ready?"',
    ],
  },
  {
    id: "en-numbers",
    script: "en",
    badge: "🔢",
    targetWpm: 38,
    lines: [
      "In 1985, Nintendo released World 1-1 with 400 seconds on the timer.",
      "Collect 100 coins = 1 Extra Life ($0.00 cost, 100% bonus)!",
      "High score: 99,850 points; Accuracy: 99.4%; Speed: 48 WPM.",
      "On 09/07/2026, Level 8-4 was cleared in 4 minutes and 57 seconds!",
    ],
  },
  {
    id: "en-advanced-vocab",
    script: "en",
    badge: "📚",
    targetWpm: 48,
    lines: [
      "Rhythm, rhyme, and symmetry require disciplined technique.",
      "Conscious practice eliminates subconscious hesitation and error.",
      "A labyrinth of magnificent architecture awaits the curious adventurer.",
      "Dexterity and perseverance transform daunting obstacles into triumph.",
    ],
  },
  {
    id: "en-code-developer",
    script: "en",
    badge: "💻",
    targetWpm: 42,
    lines: [
      "const isMaster = (wpm >= 60 && accuracy >= 98);",
      "function powerUp(hero, stars = 3) { hero.invulnerable = true; }",
      "const score = [100, 200, 500].reduce((sum, n) => sum + n, 0);",
      'if (!hasKey) { throw new Error("Castle door is locked!"); }',
    ],
  },
  {
    id: "en-literature",
    script: "en",
    badge: "📜",
    targetWpm: 52,
    lines: [
      "To be yourself in a changing world is the greatest accomplishment.",
      "The journey of a thousand miles begins with a single confident keystroke.",
      "Do not go where the path leads; go where there is no path and leave a trail.",
      "It is during our darkest moments that we must focus to see the light.",
    ],
  },
  {
    id: "en-grandmaster",
    script: "en",
    badge: "👑",
    targetWpm: 60,
    lines: [
      "Lightning-fast fingers glide across keys without a fraction of hesitation!",
      "Through fiery castles and skies, the grandmaster never looks down!",
      "Sixty words per minute with laser precision claims the golden crown!",
      "Perfection is forged in fire: conquer the ultimate realm and reign supreme!",
    ],
  },
];

export const MISSION_BY_ID = new Map(MISSIONS.map((m) => [m.id, m]));

/** Total keystrokes required to clear a mission — shown on the card. */
export function missionLength(mission: Mission): number {
  return mission.lines.reduce((sum, line) => sum + toCodePoints(line).length, 0);
}

export function nextMissionId(id: string): string | null {
  const index = MISSIONS.findIndex((m) => m.id === id);
  return index >= 0 && index < MISSIONS.length - 1 ? MISSIONS[index + 1].id : null;
}
