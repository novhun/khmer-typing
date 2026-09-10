import { DifficultyLevel, LanguageMode, ZombieType } from "./types";

/**
 * Curated Khmer and English word banks across 3 difficulty tiers.
 */
export const ZOMBIE_WORD_BANKS = {
  km: {
    1: [
      // 33 Base Consonants & simple 1-vowel letters
      "ក", "ខ", "គ", "ឃ", "ង",
      "ច", "ឆ", "ជ", "ឈ", "ញ",
      "ដ", "ឋ", "ឌ", "ឍ", "ណ",
      "ត", "ថ", "ទ", "ធ", "ន",
      "ប", "ផ", "ព", "ភ", "ម",
      "យ", "រ", "ល", "វ", "ស",
      "ហ", "ឡ", "អ",
      "កា", "កី", "កែ", "កុំ", "ខែ",
      "គោ", "ដី", "ទឹក", "ដៃ", "ជើង",
    ],
    2: [
      // 4-6 letter intermediate words & survival vocabulary
      "ខ្មោច", "ឈាម", "បាញ់", "ការពារ", "កម្លាំង",
      "កាំភ្លើង", "រត់", "មេរោគ", "គ្រាប់", "ទីក្រុង",
      "ប៉ម", "របាំង", "ព្រួញ", "កាំបិត", "មូលដ្ឋាន",
      "ជំនួយ", "ជោគជ័យ", "វិបត្តិ", "សត្រូវ", "អាវុធ",
      "ពន្លឺ", "កម្ដៅ", "ផ្សែង", "ដាវ", "ជីវិត",
    ],
    3: [
      // Stacked coeng syllables (ជើងអក្សរ) and complex compound words
      "ខ្មោចឆៅ", "សង្គ្រាម", "វិនាសកម្ម", "ប្រព័ន្ធការពារ",
      "មន្ទីរពិសោធន៍", "កម្ទេចចោល", "សម្ព័ន្ធមិត្ត", "អន្តរជាតិ",
      "មហន្តរាយ", "ព្រះច័ន្ទ", "វប្បធម៌", "សង្ក្រាន្ត",
      "បញ្ញាញាណ", "ឧក្រិដ្ឋកម្ម", "អភិវឌ្ឍន៍", "កងទ័ពពិសេស",
      "បន្ទាយការពារ", "ការផ្ទុះឡើង", "សេចក្ដីក្លាហាន", "ជ័យជម្នះ",
    ],
  },
  en: {
    1: [
      // Fast 2-3 letter survival words
      "RUN", "ZAP", "DIE", "HIT", "GO",
      "GUN", "EYE", "WAR", "RED", "BOX",
      "SUN", "FLY", "ARM", "AXE", "BIT",
      "BOW", "CUT", "DIG", "FOG", "GAS",
      "ICE", "LOG", "MAP", "NET", "PIT",
      "RIP", "SAW", "TAR", "WEB", "AIM",
    ],
    2: [
      // 4-6 letter tactical survival vocabulary
      "ZOMBIE", "DEFEND", "ATTACK", "SHIELD", "BULLET",
      "RESCUE", "SURVIVE", "HUNTER", "DANGER", "WEAPON",
      "TARGET", "BUNKER", "PATROL", "RADAR", "PLASMA",
      "TURRET", "HORDE", "OUTPOST", "SENTRY", "COMBAT",
      "SNIPER", "MEDIC", "ARMOR", "IMPACT", "STRIKE",
    ],
    3: [
      // 7-12 letter apocalypse and military compound words
      "APOCALYPSE", "BIOHAZARD", "EXTERMINATE", "FORTRESS",
      "QUARANTINE", "REINFORCEMENT", "DESTRUCTION", "CATASTROPHE",
      "ANNIHILATION", "BARRICADE", "NIGHTMARE", "STERILIZATION",
      "OUTBREAK", "RESISTANCE", "CONTAMINATION", "INVINCIBLE",
      "OVERPOWERED", "DEVASTATION", "TACTICAL", "CONTAINMENT",
    ],
  },
};

/** Get a random word matching language and difficulty */
export function getRandomZombieWord(
  language: LanguageMode,
  difficulty: DifficultyLevel
): string {
  const words = ZOMBIE_WORD_BANKS[language][difficulty];
  const index = Math.floor(Math.random() * words.length);
  return words[index];
}

/** Determine zombie properties based on difficulty and wave */
export function getZombieSpawnProps(
  difficulty: DifficultyLevel,
  wave: number
): {
  type: ZombieType;
  speed: number;
  maxHp: number;
  radius: number;
} {
  const rand = Math.random();

  // Wave speed multiplier (slight speed increase every wave)
  const waveBonus = Math.min(wave * 0.08, 0.6);

  if (difficulty === 1) {
    // Level 1: mostly slow walkers
    if (rand < 0.85) {
      return { type: "walker", speed: 0.75 + waveBonus, maxHp: 1, radius: 26 };
    } else {
      return { type: "runner", speed: 1.2 + waveBonus, maxHp: 1, radius: 22 };
    }
  }

  if (difficulty === 2) {
    // Level 2: mix of walkers, runners, and occasional brutes
    if (rand < 0.45) {
      return { type: "walker", speed: 1.1 + waveBonus, maxHp: 1, radius: 26 };
    } else if (rand < 0.85) {
      return { type: "runner", speed: 1.8 + waveBonus, maxHp: 1, radius: 22 };
    } else {
      return { type: "brute", speed: 0.85 + waveBonus, maxHp: 2, radius: 34 };
    }
  }

  // Level 3: aggressive runners & tanks
  if (rand < 0.3) {
    return { type: "walker", speed: 1.4 + waveBonus, maxHp: 1, radius: 26 };
  } else if (rand < 0.75) {
    return { type: "runner", speed: 2.3 + waveBonus, maxHp: 1, radius: 22 };
  } else {
    return { type: "brute", speed: 1.2 + waveBonus, maxHp: 3, radius: 36 };
  }
}
