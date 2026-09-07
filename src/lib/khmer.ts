/**
 * Khmer script utilities.
 *
 * Why this file exists
 * --------------------
 * `Intl.Segmenter` (UAX #29 extended grapheme clusters) is *not* usable for Khmer
 * orthographic syllables: U+17D2 COENG has the `Extend` property, so "ក្ក" is split
 * into ["ក្", "ក"] — the trailing consonant is torn off its own subscript and the
 * browser renders a dotted circle. We therefore implement the Khmer orthographic
 * cluster rules ourselves.
 *
 * Two different units matter to a typing tutor, and conflating them is the classic bug:
 *
 *   1. KEYSTROKE UNIT  -> a single code point. Every Khmer key emits one code point
 *      (ជើង = J, ា = A, ...), so comparison/progress must be per code point.
 *   2. DISPLAY UNIT    -> an orthographic cluster. Rendering must never break a
 *      base + coeng + vowel + sign stack, or shaping collapses into dotted circles.
 *
 * `toCodePoints()` gives (1); `segmentClusters()` gives (2) and tells each cluster
 * which code-point range it owns, so the UI can style whole clusters by cursor state.
 */

/** U+17D2 — the sign that turns the following consonant into a subscript (ជើង). */
export const COENG = "្";
/** Zero-width space: Khmer's real word separator. Invisible, but a keystroke. */
export const ZWSP = "​";
/** Zero-width non-joiner, occasionally used to suppress ligatures. */
export const ZWNJ = "‌";
/** Zero-width joiner, used to force a ligature. */
export const ZWJ = "‍";

const cp = (ch: string): number => ch.codePointAt(0) ?? 0;

/* ---------------------------------------------------------------------- *
 * Character classification (Unicode block U+1780–U+17FF)
 * ---------------------------------------------------------------------- */

/** ក (U+1780) … អ (U+17A2) — the 33 base consonants plus ឡ/អ. */
export const isConsonant = (ch: string): boolean => cp(ch) >= 0x1780 && cp(ch) <= 0x17a2;

/** ឣ (U+17A3) … ឳ (U+17B3) — independent vowels. */
export const isIndependentVowel = (ch: string): boolean => cp(ch) >= 0x17a3 && cp(ch) <= 0x17b3;

/** ា (U+17B6) … ៅ (U+17C5) — dependent vowel signs (ស្រៈនិស្ស័យ). */
export const isDependentVowel = (ch: string): boolean => cp(ch) >= 0x17b6 && cp(ch) <= 0x17c5;

/**
 * Nonspacing / spacing combining marks: U+17C6–U+17D3 (nikahit, reahmuk, bantoc,
 * robat, toandakhiat, COENG, …) plus U+17DD ATTHACAN.
 *
 * NOTE the deliberately tight upper bound. U+17D4–U+17DC (។ ៕ ៖ ៗ ៘ ៙ ៚ ៛ ៜ) live
 * in the same Unicode block but are standalone punctuation/symbols — treating them
 * as combining marks would glue "។" onto the preceding syllable and produce a
 * cluster that can never be reached by the cursor.
 */
export const isCombiningMark = (ch: string): boolean =>
  (cp(ch) >= 0x17c6 && cp(ch) <= 0x17d3) || cp(ch) === 0x17dd;

/** ។ (U+17D4) … ៜ (U+17DC) — Khmer punctuation and symbols. Standalone glyphs. */
export const isKhmerPunctuation = (ch: string): boolean => cp(ch) >= 0x17d4 && cp(ch) <= 0x17dc;

/** ០ (U+17E0) … ៩ (U+17E9) — Khmer digits. */
export const isKhmerDigit = (ch: string): boolean => cp(ch) >= 0x17e0 && cp(ch) <= 0x17e9;

export const isCoeng = (ch: string): boolean => ch === COENG;

export const isInvisible = (ch: string): boolean =>
  ch === ZWSP || ch === ZWNJ || ch === ZWJ;

/** Anything in the Khmer block or its symbol supplement. */
export const isKhmer = (ch: string): boolean =>
  (cp(ch) >= 0x1780 && cp(ch) <= 0x17ff) || (cp(ch) >= 0x19e0 && cp(ch) <= 0x19ff);

/** True when the character must glue onto the cluster already in progress. */
const isCombining = (ch: string): boolean =>
  isDependentVowel(ch) || (isCombiningMark(ch) && !isCoeng(ch)) || isInvisible(ch);

/** True when the character can legally open a new orthographic cluster. */
export const isClusterBase = (ch: string): boolean => !isCombining(ch);

/* ---------------------------------------------------------------------- *
 * Segmentation
 * ---------------------------------------------------------------------- */

/**
 * Split a string into code points (NOT UTF-16 units). This is the unit a
 * keystroke maps to, and therefore the unit the typing engine compares.
 */
export function toCodePoints(text: string): string[] {
  return Array.from(text);
}

export interface Cluster {
  /** The full renderable text of the cluster, e.g. "ស្រ" or "ក" or " ". */
  text: string;
  /** Index of the cluster's first code point within the source string. */
  start: number;
  /** Index one past the cluster's last code point. */
  end: number;
  /** Convenience flag: a literal space (word boundary in Latin text). */
  isSpace: boolean;
}

/**
 * Group text into Khmer orthographic clusters.
 *
 * Grammar (greedy, left to right):
 *   cluster := base (COENG base)* (vowel | sign | ZW*)*
 *
 * A dangling COENG at the end of input stays attached to its base so that a
 * half-typed "ស្" still renders as one unit instead of jumping to a new column.
 * Non-Khmer characters (Latin, digits, punctuation, space) become single-char
 * clusters, which makes the same renderer correct for English missions.
 */
export function segmentClusters(text: string): Cluster[] {
  const chars = toCodePoints(text);
  const out: Cluster[] = [];
  let i = 0;

  while (i < chars.length) {
    const start = i;
    let body = chars[i];
    i += 1;

    // Only Khmer bases can accumulate subscripts / vowels / signs.
    if (isKhmer(body) && !isInvisible(body) && !isKhmerPunctuation(body)) {
      while (i < chars.length) {
        const ch = chars[i];

        // COENG + base consonant => stacked sub-consonant, consume both.
        if (isCoeng(ch)) {
          const next = chars[i + 1];
          if (next !== undefined && (isConsonant(next) || isIndependentVowel(next))) {
            body += ch + next;
            i += 2;
            continue;
          }
          // Trailing COENG with nothing after it yet (mid-typing): keep it here.
          if (next === undefined) {
            body += ch;
            i += 1;
          }
          break;
        }

        if (isCombining(ch)) {
          body += ch;
          i += 1;
          continue;
        }

        break;
      }
    }

    out.push({ text: body, start, end: i, isSpace: body === " " });
  }

  return out;
}

/* ---------------------------------------------------------------------- *
 * Human-readable names (used by the "next key" hint chip)
 * ---------------------------------------------------------------------- */

/** i18n keys for characters that are invisible or hard to read at chip size. */
const NAMED_CHARS: Record<string, string> = {
  " ": "chars.space",
  [COENG]: "chars.coeng",
  "ំ": "chars.nikahit", // ំ
  "ះ": "chars.reahmuk", // ះ
  "់": "chars.bantoc", // ់
  "៉": "chars.muusikatoan", // ៉
  "៊": "chars.triisap", // ៊
  "។": "chars.khan", // ។
  "៖": "chars.yuukaleapintu", // ៖
  "ៃ": "chars.saraAi", // ៃ — easy to confuse with ែ
  "៕": "chars.bariyoosan", // ៕
  "៛": "chars.riel", // ៛
  "ៗ": "chars.lektoo", // ៗ
  [ZWSP]: "chars.zwsp", // invisible: must be named or it cannot be taught
  [ZWNJ]: "chars.zwnj",
  [ZWJ]: "chars.zwj",
};

/**
 * Returns the translation key describing a character, or `null` when the glyph
 * speaks for itself. Digits always speak for themselves.
 */
export function charNameKey(ch: string): string | null {
  if (isKhmerDigit(ch)) return null;
  return NAMED_CHARS[ch] ?? null;
}

/**
 * A printable stand-in for characters with no advance width of their own.
 * Combining marks are shown on a dotted circle base (U+25CC) — the same
 * convention the Unicode charts use — so the chip never renders as a blank box.
 */
export function displayGlyph(ch: string): string {
  if (ch === " ") return "␣";
  if (ch === ZWSP) return "⎵";
  if (ch === ZWNJ) return "∅";
  if (ch === ZWJ) return "⁀";
  if (isDependentVowel(ch) || isCombiningMark(ch)) return "◌" + ch;
  return ch;
}

/** Word count that works for both scripts: Khmer uses ZWSP, Latin uses spaces. */
export function countWords(text: string): number {
  return text.split(/[\s​]+/u).filter(Boolean).length;
}
