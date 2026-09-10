import { DifficultyLevel, FruitConfig, FruitKind, LanguageMode } from "./types";

export const FRUIT_CONFIGS: Record<FruitKind, FruitConfig> = {
  watermelon: {
    kind: "watermelon",
    nameEn: "Watermelon",
    nameKm: "ឪឡឹក",
    emoji: "🍉",
    color: "#15803d",       // deep green rind
    innerColor: "#ef4444",  // juicy ruby red
    radius: 46,
  },
  orange: {
    kind: "orange",
    nameEn: "Orange",
    nameKm: "ក្រូច",
    emoji: "🍊",
    color: "#ea580c",       // bright orange
    innerColor: "#fb923c",  // citrus pulp
    radius: 38,
  },
  apple: {
    kind: "apple",
    nameEn: "Apple",
    nameKm: "ប៉ោម",
    emoji: "🍎",
    color: "#dc2626",       // crimson red
    innerColor: "#fef08a",  // light apple flesh
    radius: 38,
  },
  banana: {
    kind: "banana",
    nameEn: "Banana",
    nameKm: "ចេក",
    emoji: "🍌",
    color: "#ca8a04",       // golden yellow peel
    innerColor: "#fef9c3",  // pale banana inside
    radius: 40,
  },
  strawberry: {
    kind: "strawberry",
    nameEn: "Strawberry",
    nameKm: "ស្ត្រប៊ែរី",
    emoji: "🍓",
    color: "#e11d48",       // vibrant strawberry
    innerColor: "#fda4af",  // pink center
    radius: 34,
  },
  coconut: {
    kind: "coconut",
    nameEn: "Coconut",
    nameKm: "ដូង",
    emoji: "🥥",
    color: "#78350f",       // brown coconut husk
    innerColor: "#f8fafc",  // pure white coconut meat
    radius: 42,
  },
  dragonfruit: {
    kind: "dragonfruit",
    nameEn: "Dragonfruit",
    nameKm: "ស្រកានាគ",
    emoji: "🫐",
    color: "#be185d",       // magenta skin
    innerColor: "#f1f5f9",  // speckled flesh
    radius: 42,
  },
  pineapple: {
    kind: "pineapple",
    nameEn: "Pineapple",
    nameKm: "ម្នាស់",
    emoji: "🍍",
    color: "#d97706",       // golden crown
    innerColor: "#fef08a",  // sweet yellow core
    radius: 46,
  },
};

export const FRUIT_KINDS: FruitKind[] = [
  "watermelon",
  "orange",
  "apple",
  "banana",
  "strawberry",
  "coconut",
  "dragonfruit",
  "pineapple",
];

// Bilingual word dictionary split by difficulty
export const WORD_DICTIONARY: Record<
  LanguageMode,
  Record<DifficultyLevel, string[]>
> = {
  km: {
    // Level 1: 33 Khmer consonants & basic single-vowel syllables
    1: [
      "ក", "ខ", "គ", "ឃ", "ង",
      "ច", "ឆ", "ជ", "ឈ", "ញ",
      "ដ", "ឋ", "ឌ", "ឍ", "ណ",
      "ត", "ថ", "ទ", "ធ", "ន",
      "ប", "ផ", "ព", "ភ", "ម",
      "យ", "រ", "ល", "វ", "ស",
      "ហ", "ឡ", "អ",
      "កា", "កី", "គេ", "ខែ", "ចាំ",
      "ទៅ", "ដៃ", "ទឹក", "សុំ", "ធំ",
      "រត់", "ដើរ", "ហោះ", "ចង់", "ជួប"
    ],
    // Level 2: Everyday words, fruit names, common verbs & places (2 to 4 characters)
    2: [
      "ផ្លែឈើ", "ចេក", "ក្រូច", "ស្វាយ", "ល្ហុង",
      "ឪឡឹក", "ដូង", "ម្នាស់", "ទទឹម", "ទៀប",
      "ម្កាក់", "ព្រីង", "សាលា", "សៀវភៅ", "មិត្ត",
      "សប្បាយ", "ស្រុក", "រៀន", "កម្ពុជា", "ផ្កា",
      "ទឹកឃ្មុំ", "សួនច្បារ", "កាំបិត", "លឿន", "ពូកែ",
      "ស្មៅ", "ទន្លេ", "ភ្នំ", "កោះ", "សមុទ្រ"
    ],
    // Level 3: Advanced stacked syllables with coeng (ជើងអក្សរ), compound words & cultural terms
    3: [
      "សង្ក្រាន្ត", "ព្រះច័ន្ទ", "ប្រណាំង", "វប្បធម៌", "អន្តរជាតិ",
      "វិទ្យាសាស្ត្រ", "សេចក្ដីសុខ", "ធម្មជាតិ", "អស្ចារ្យ", "ឥន្ទធនូ",
      "បញ្ញាវន្ត", "សាមគ្គីភាព", "អរិយធម៌", "ព្រះវិហារ", "មហាសមុទ្រ",
      "ប្រជាធិបតេយ្យ", "ស្ថាបត្យកម្ម", "មហោស្រព", "ប្រវត្តិសាស្ត្រ", "សុភមង្គល"
    ],
  },
  en: {
    // Level 1: Single letters & punchy 3-letter words
    1: [
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
      "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
      "CAT", "SUN", "SKY", "RUN", "RED", "JOY", "ICE", "TOP", "WIN",
      "GEM", "KEY", "FLY", "ZIP", "HIT", "POP", "EAT", "CUT", "FOX"
    ],
    // Level 2: 4-6 letter arcade and fruit words
    2: [
      "FRUIT", "SLASH", "BLADE", "APPLE", "NINJA", "GRAPE", "MELON",
      "MANGO", "WATER", "QUICK", "SWORD", "COMBO", "SHARP", "FRESH",
      "SPEED", "JUICE", "TASTY", "BERRY", "SWEET", "FROST", "SWIFT",
      "FOCUS", "SCORE", "POWER", "STEEL", "FLASH"
    ],
    // Level 3: Longer 7+ letter high-speed arcade vocabulary
    3: [
      "WATERMELON", "DRAGONFRUIT", "PINEAPPLE", "STRAWBERRY", "LIGHTNING",
      "SHADOWBLADE", "EXCELLENT", "CHAMPION", "PRECISION", "ADVENTURE",
      "SPLENDID", "WHIRLWIND", "SUPERNOVA", "MASTERPIECE", "OVERDRIVE",
      "KHMERHERO", "UNSTOPPABLE", "HYPERSPEED", "EXECUTION"
    ],
  },
};

export function getRandomFruit(): FruitConfig {
  const kind = FRUIT_KINDS[Math.floor(Math.random() * FRUIT_KINDS.length)];
  return FRUIT_CONFIGS[kind];
}

export function getRandomWord(lang: LanguageMode, difficulty: DifficultyLevel): string {
  const list = WORD_DICTIONARY[lang][difficulty];
  return list[Math.floor(Math.random() * list.length)];
}
