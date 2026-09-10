import { DifficultyLevel, LanguageMode, TargetKind } from "./types";

export interface FruitConfig {
  nameEn: string;
  nameKm: string;
  emoji: string;
  color: string;
  innerColor: string;
  radius: number;
}

export const FRUIT_CONFIGS: FruitConfig[] = [
  {
    nameEn: "WATERMELON",
    nameKm: "ឪឡឹក",
    emoji: "🍉",
    color: "#15803d",
    innerColor: "#ef4444",
    radius: 46,
  },
  {
    nameEn: "ORANGE",
    nameKm: "ក្រូច",
    emoji: "🍊",
    color: "#ea580c",
    innerColor: "#fed7aa",
    radius: 38,
  },
  {
    nameEn: "APPLE",
    nameKm: "ប៉ោម",
    emoji: "🍎",
    color: "#dc2626",
    innerColor: "#fef08a",
    radius: 36,
  },
  {
    nameEn: "BANANA",
    nameKm: "ចេក",
    emoji: "🍌",
    color: "#eab308",
    innerColor: "#fef9c3",
    radius: 40,
  },
  {
    nameEn: "STRAWBERRY",
    nameKm: "ស្ត្របឺរី",
    emoji: "🍓",
    color: "#e11d48",
    innerColor: "#fecdd3",
    radius: 34,
  },
  {
    nameEn: "PINEAPPLE",
    nameKm: "ម្នាស់",
    emoji: "🍍",
    color: "#ca8a04",
    innerColor: "#fef08a",
    radius: 44,
  },
  {
    nameEn: "COCONUT",
    nameKm: "ដូង",
    emoji: "🥥",
    color: "#78350f",
    innerColor: "#f8fafc",
    radius: 42,
  },
];

export const MOUSE_WORD_BANKS = {
  km: {
    1: [
      // 33 Base consonants & single vowels
      "ក", "ខ", "គ", "ឃ", "ង",
      "ច", "ឆ", "ជ", "ឈ", "ញ",
      "ដ", "ឋ", "ឌ", "ឍ", "ណ",
      "ត", "ថ", "ទ", "ធ", "ន",
      "ប", "ផ", "ព", "ភ", "ម",
      "យ", "រ", "ល", "វ", "ស",
      "ហ", "ឡ", "អ",
      "កា", "កី", "កែ", "កុំ", "ខែ", "គោ", "ដី",
    ],
    2: [
      // 4-6 letter fruits and arcade action words
      "ផ្លែឈើ", "ឪឡឹក", "ក្រូច", "ចេក", "ម្នាស់",
      "ស្វាយ", "សាច់ក្រក", "កាំបិត", "ផ្លែដូង", "កាត់",
      "រហ័ស", "ដាវមុត", "ពិន្ទុ", "ចលនា", "កម្លាំង",
      "ពន្លឺ", "ស្រស់", "ផ្អែម", "ជូរ", "ឆ្ងាញ់",
    ],
    3: [
      // Complex stacked coeng syllables (ជើងអក្សរ)
      "សង្ក្រាន្ត", "ព្រះច័ន្ទ", "វប្បធម៌", "កម្ពុជា",
      "សម្ព័ន្ធមិត្ត", "អន្តរជាតិ", "រស្មីពន្លឺ", "មហោស្រព",
      "សិល្បៈខ្មែរ", "អរិយធម៌", "សង្គ្រាមដាវ", "កាត់កម្ទេច",
      "ជ័យជំនះ", "កំពូលនិនចា", "រលកធាតុអាកាស", "វិញ្ញាណដាវ",
    ],
  },
  en: {
    1: [
      "CAT", "DOG", "SUN", "RUN", "ZAP",
      "HIT", "CUT", "FLY", "POP", "JOY",
      "ICE", "RED", "FOX", "HOP", "TOP",
      "WIN", "SKY", "AIR", "BIT", "HOT",
    ],
    2: [
      "SLICE", "BLADE", "SLASH", "SWORD", "APPLE",
      "MELON", "FRUIT", "SPEED", "NINJA", "COMBO",
      "STRIKE", "ORANGE", "SHARP", "CLEAVE", "POWER",
      "KATANA", "FRENZY", "JUICE", "BURST", "SPLIT",
    ],
    3: [
      "WATERMELON", "DRAGONFRUIT", "PINEAPPLE", "LIGHTNING",
      "GRANDMASTER", "DEVASTATION", "SHOCKWAVE", "INVINCIBLE",
      "CHAMPIONSHIP", "ACCELERATION", "SUPERCHARGED", "EXTERMINATOR",
    ],
  },
};

export function getRandomTargetWord(
  language: LanguageMode,
  difficulty: DifficultyLevel
): string {
  const words = MOUSE_WORD_BANKS[language][difficulty];
  return words[Math.floor(Math.random() * words.length)];
}

export function getRandomFruitConfig(): FruitConfig {
  return FRUIT_CONFIGS[Math.floor(Math.random() * FRUIT_CONFIGS.length)];
}

/** Determine whether to spawn a fruit, a bomb trap, or a golden fruit */
export function getSpawnKind(difficulty: DifficultyLevel): TargetKind {
  const rand = Math.random();

  if (difficulty === 1) {
    // Level 1: almost all fruits, rare bomb (6%)
    if (rand < 0.06) return "bomb";
    if (rand < 0.12) return "golden";
    return "fruit";
  }

  if (difficulty === 2) {
    // Level 2: 18% bomb traps, 10% golden
    if (rand < 0.18) return "bomb";
    if (rand < 0.28) return "golden";
    return "fruit";
  }

  // Level 3: 28% bomb traps, 12% golden
  if (rand < 0.28) return "bomb";
  if (rand < 0.40) return "golden";
  return "fruit";
}
