/**
 * Keyboard model for the on-screen HUD.
 *
 * IMPORTANT: this data drives *hints only*. Real input arrives from the OS keyboard
 * as characters (see `useTypingEngine`), so a wrong legend degrades a hint — it can
 * never make a correct keystroke count as wrong. Everything is derived from one
 * physical skeleton, so fingers/sizes are defined exactly once.
 */

export type Finger =
  | "l-pinky"
  | "l-ring"
  | "l-middle"
  | "l-index"
  | "thumb"
  | "r-index"
  | "r-middle"
  | "r-ring"
  | "r-pinky";

/** A concrete key table the HUD can render. */
export type LayoutId = "en" | "kh-nida" | "kh-sbbic";

/** What a mission is written in. Khmer resolves to whichever table the learner picked. */
export type Script = "en" | "kh";

export type KhmerLayoutId = Extract<LayoutId, `kh-${string}`>;

export const KHMER_LAYOUTS: KhmerLayoutId[] = ["kh-nida", "kh-sbbic"];

export const DEFAULT_KHMER_LAYOUT: KhmerLayoutId = "kh-sbbic";

/** Resolve a mission's script against the learner's Khmer layout preference. */
export const resolveLayout = (script: Script, khmer: KhmerLayoutId): LayoutId =>
  script === "en" ? "en" : khmer;

/** Which hand a finger belongs to — used to pick the opposite Shift key. */
export const handOf = (finger: Finger): "left" | "right" | "thumb" =>
  finger === "thumb" ? "thumb" : finger.startsWith("l-") ? "left" : "right";

interface PhysicalKey {
  /** `KeyboardEvent.code` value; also our stable React key. */
  code: string;
  finger: Finger;
  /** Width in "key units" (1u = one alphanumeric key). Defaults to 1. */
  unit?: number;
  /** Translation key for modifier caps that show a word rather than a glyph. */
  labelKey?: string;
  /** Home-row resting position (asdf / jkl;). */
  home?: boolean;
}

/* ---------------------------------------------------------------------- *
 * Physical skeleton — 60% ANSI board
 * ---------------------------------------------------------------------- */

const SKELETON: PhysicalKey[][] = [
  [
    { code: "Backquote", finger: "l-pinky" },
    { code: "Digit1", finger: "l-pinky" },
    { code: "Digit2", finger: "l-ring" },
    { code: "Digit3", finger: "l-middle" },
    { code: "Digit4", finger: "l-index" },
    { code: "Digit5", finger: "l-index" },
    { code: "Digit6", finger: "r-index" },
    { code: "Digit7", finger: "r-index" },
    { code: "Digit8", finger: "r-middle" },
    { code: "Digit9", finger: "r-ring" },
    { code: "Digit0", finger: "r-pinky" },
    { code: "Minus", finger: "r-pinky" },
    { code: "Equal", finger: "r-pinky" },
    { code: "Backspace", finger: "r-pinky", unit: 2, labelKey: "keyboard.backspace" },
  ],
  [
    { code: "Tab", finger: "l-pinky", unit: 1.5, labelKey: "keyboard.tab" },
    { code: "KeyQ", finger: "l-pinky" },
    { code: "KeyW", finger: "l-ring" },
    { code: "KeyE", finger: "l-middle" },
    { code: "KeyR", finger: "l-index" },
    { code: "KeyT", finger: "l-index" },
    { code: "KeyY", finger: "r-index" },
    { code: "KeyU", finger: "r-index" },
    { code: "KeyI", finger: "r-middle" },
    { code: "KeyO", finger: "r-ring" },
    { code: "KeyP", finger: "r-pinky" },
    { code: "BracketLeft", finger: "r-pinky" },
    { code: "BracketRight", finger: "r-pinky" },
    { code: "Backslash", finger: "r-pinky", unit: 1.5 },
  ],
  [
    { code: "CapsLock", finger: "l-pinky", unit: 1.75, labelKey: "keyboard.caps" },
    { code: "KeyA", finger: "l-pinky", home: true },
    { code: "KeyS", finger: "l-ring", home: true },
    { code: "KeyD", finger: "l-middle", home: true },
    { code: "KeyF", finger: "l-index", home: true },
    { code: "KeyG", finger: "l-index" },
    { code: "KeyH", finger: "r-index" },
    { code: "KeyJ", finger: "r-index", home: true },
    { code: "KeyK", finger: "r-middle", home: true },
    { code: "KeyL", finger: "r-ring", home: true },
    { code: "Semicolon", finger: "r-pinky", home: true },
    { code: "Quote", finger: "r-pinky" },
    { code: "Enter", finger: "r-pinky", unit: 2.25, labelKey: "keyboard.enter" },
  ],
  [
    { code: "ShiftLeft", finger: "l-pinky", unit: 2.25, labelKey: "keyboard.shift" },
    { code: "KeyZ", finger: "l-pinky" },
    { code: "KeyX", finger: "l-ring" },
    { code: "KeyC", finger: "l-middle" },
    { code: "KeyV", finger: "l-index" },
    { code: "KeyB", finger: "l-index" },
    { code: "KeyN", finger: "r-index" },
    { code: "KeyM", finger: "r-index" },
    { code: "Comma", finger: "r-middle" },
    { code: "Period", finger: "r-ring" },
    { code: "Slash", finger: "r-pinky" },
    { code: "ShiftRight", finger: "r-pinky", unit: 2.75, labelKey: "keyboard.shift" },
  ],
  // Bottom row exists so the Alt/Option key can actually be pointed at. Physical
  // order differs by platform (macOS: Ctrl Option Cmd; Windows: Ctrl Win Alt), and
  // <VirtualKeyboard> reorders this trio for macOS.
  [
    { code: "ControlLeft", finger: "l-pinky", unit: 1.5, labelKey: "keyboard.ctrl" },
    { code: "MetaLeft", finger: "l-pinky", unit: 1.25, labelKey: "keyboard.meta" },
    { code: "AltLeft", finger: "l-pinky", unit: 1.25, labelKey: "keyboard.alt" },
    { code: "Space", finger: "thumb", unit: 7.25, labelKey: "keyboard.space" },
    { code: "AltRight", finger: "r-pinky", unit: 1.25, labelKey: "keyboard.alt" },
    { code: "MetaRight", finger: "r-pinky", unit: 1.25, labelKey: "keyboard.meta" },
    { code: "ControlRight", finger: "r-pinky", unit: 1.25, labelKey: "keyboard.ctrl" },
  ],
];

/** Modifier / whitespace caps that never carry a printable legend of their own. */
const MODIFIER_CODES = new Set([
  "Backspace",
  "Tab",
  "CapsLock",
  "Enter",
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight",
]);

/* ---------------------------------------------------------------------- *
 * Legends: [unshifted, shifted]
 * ---------------------------------------------------------------------- */

/**
 * A key's four planes: [base, Shift, Alt, Shift+Alt].
 *
 * "Alt" is **Option** on macOS and **AltGr** (or Ctrl+Alt) on Windows/Linux. On
 * the Khmer layout this plane is not an afterthought — it is where every Latin
 * symbol lives (`@ $ € * ( ) + = \ ; ' , . ?`), because the base and Shift
 * planes are fully occupied by Khmer.
 */
export type LegendSet = [base: string, shift: string, alt: string, shiftAlt: string];

/** Latin planes. English drills never need Alt, so those two are left empty. */
const EN_LEGENDS: Record<string, [string, string]> = {
  Backquote: ["`", "~"],
  Digit1: ["1", "!"],
  Digit2: ["2", "@"],
  Digit3: ["3", "#"],
  Digit4: ["4", "$"],
  Digit5: ["5", "%"],
  Digit6: ["6", "^"],
  Digit7: ["7", "&"],
  Digit8: ["8", "*"],
  Digit9: ["9", "("],
  Digit0: ["0", ")"],
  Minus: ["-", "_"],
  Equal: ["=", "+"],
  KeyQ: ["q", "Q"],
  KeyW: ["w", "W"],
  KeyE: ["e", "E"],
  KeyR: ["r", "R"],
  KeyT: ["t", "T"],
  KeyY: ["y", "Y"],
  KeyU: ["u", "U"],
  KeyI: ["i", "I"],
  KeyO: ["o", "O"],
  KeyP: ["p", "P"],
  BracketLeft: ["[", "{"],
  BracketRight: ["]", "}"],
  Backslash: ["\\", "|"],
  KeyA: ["a", "A"],
  KeyS: ["s", "S"],
  KeyD: ["d", "D"],
  KeyF: ["f", "F"],
  KeyG: ["g", "G"],
  KeyH: ["h", "H"],
  KeyJ: ["j", "J"],
  KeyK: ["k", "K"],
  KeyL: ["l", "L"],
  Semicolon: [";", ":"],
  Quote: ["'", '"'],
  KeyZ: ["z", "Z"],
  KeyX: ["x", "X"],
  KeyC: ["c", "C"],
  KeyV: ["v", "V"],
  KeyB: ["b", "B"],
  KeyN: ["n", "N"],
  KeyM: ["m", "M"],
  Comma: [",", "<"],
  Period: [".", ">"],
  Slash: ["/", "?"],
  Space: [" ", " "],
};

/**
 * TWO Khmer layouts ship here, because Cambodia genuinely uses two.
 *
 * Both tables were extracted programmatically from this machine's installed
 * input sources (Carbon `UCKeyTranslate` over every virtual key across all four
 * modifier planes), never transcribed from a chart. They differ in 82 of 192
 * cells, so guessing between them is not an option:
 *
 *   ឯ         NiDA: Shift+/      SBBIC: Option+E
 *   Space     NiDA: space        SBBIC: ZWSP  (and Shift+Space is reversed too)
 *   €         NiDA: Option+5     SBBIC: absent
 *   Shift+A   NiDA: ឫ            SBBIC: ាំ  (two code points)
 *
 * `KH_NIDA` is the layout Apple and Microsoft ship as "Khmer" — the government
 * standard. `KH_SBBIC` is the SBBIC Khmer Unicode keyboard, installed by hand and
 * extremely widely used in Cambodia. Learners must be able to pick.
 */
const KH_NIDA_LEGENDS: Record<string, LegendSet> = {
  Backquote: ["«", "»", "\u200D", "~"],
  Digit1: ["១", "!", "\u200C", "…"],
  Digit2: ["២", "ៗ", "@", "©"],
  Digit3: ["៣", '"', "៑", "®"],
  Digit4: ["៤", "៛", "$", "™"],  // Option+4 = $
  Digit5: ["៥", "%", "€", "’"],
  Digit6: ["៦", "៍", "៙", "‘"],
  Digit7: ["៧", "័", "៚", "–"],
  Digit8: ["៨", "៏", "*", "•"],
  Digit9: ["៩", "ឰ", "(", "—"],
  Digit0: ["០", "ឳ", ")", "×"],
  Minus: ["ឥ", "៌", "+", "−"],
  Equal: ["ឲ", "៎", "=", "+"],
  KeyQ: ["ឆ", "ឈ", "", ""],
  KeyW: ["ឹ", "ឺ", "", ""],
  KeyE: ["េ", "ែ", "", ""],
  KeyR: ["រ", "ឬ", "", ""],
  KeyT: ["ត", "ទ", "ថ", ""],
  KeyY: ["យ", "ួ", "", ""],
  KeyU: ["ុ", "ូ", "", ""],
  KeyI: ["ិ", "ី", "", ""],
  KeyO: ["ោ", "ៅ", "", ""],
  KeyP: ["ផ", "ភ", "", ""],
  BracketLeft: ["ៀ", "ឿ", "ឨ", ""],
  BracketRight: ["ឪ", "ឧ", "ឩ", ""],
  Backslash: ["ឭ", "ឮ", "\\", ""],
  KeyA: ["ា", "ឫ", "ៜ", ""],
  KeyS: ["ស", "ៃ", "ឝ", "ឞ"],  // Shift+S = ៃ SARA AI
  KeyD: ["ដ", "ឌ", "ឞ", ""],
  KeyF: ["ថ", "ធ", "", ""],
  KeyG: ["ង", "អ", "", ""],
  KeyH: ["ហ", "ះ", "", ""],
  KeyJ: ["្", "ញ", "", ""],  // ្ COENG
  KeyK: ["ក", "គ", "", ""],
  KeyL: ["ល", "ឡ", "", ""],
  Semicolon: ["ើ", "៖", ";", ""],
  Quote: ["់", "៉", "'", ""],
  KeyZ: ["ឋ", "ឍ", "", ""],
  KeyX: ["ខ", "ឃ", "", ""],
  KeyC: ["ច", "ជ", "", ""],
  KeyV: ["វ", "ៈ", "", ""],
  KeyB: ["ប", "ព", "", ""],
  KeyN: ["ន", "ណ", "", ""],
  KeyM: ["ម", "ំ", "", ""],
  Comma: ["ឦ", "ឱ", ",", ""],
  Period: ["។", "៕", ".", ""],
  Slash: ["៊", "ឯ", "?", ""],  // Shift+/ = ឯ  (SBBIC puts ឯ on Option+E instead)
  Space: [" ", "\u200B", " ", " "],  // Shift+Space = ZWSP
};

/** SBBIC Khmer Unicode keyboard. Note the reversed Space and the ឯ placement. */
const KH_SBBIC_LEGENDS: Record<string, LegendSet> = {
  Backquote: ["«", "»", "។ល។", ""],
  Digit1: ["១", "!", "\u200C", ""],
  Digit2: ["២", "ៗ", "@", ""],
  Digit3: ["៣", '"', "៑", ""],
  Digit4: ["៤", "៛", "$", ""],  // Option+4 = $
  Digit5: ["៥", "%", "ៜ", ""],
  Digit6: ["៦", "៍", "៙", ""],
  Digit7: ["៧", "័", "៚", ""],
  Digit8: ["៨", "៏", "*", ""],
  Digit9: ["៩", "(", "{", ""],
  Digit0: ["០", ")", "}", ""],
  Minus: ["ឥ", "៌", "៝", ""],
  Equal: ["ឲ", "ឱ", "៎", ""],
  KeyQ: ["ឆ", "ឈ", "", "᧠"],
  KeyW: ["ឹ", "ឺ", "", "᧡"],
  KeyE: ["េ", "ែ", "ឯ", "᧢"],  // Option+E = ឯ  (NiDA puts ឯ on Shift+/ instead)
  KeyR: ["រ", "ឬ", "ឫ", "᧣"],
  KeyT: ["ត", "ទ", "", "᧤"],
  KeyY: ["យ", "ួ", "", "᧥"],
  KeyU: ["ុ", "ូ", "", "᧦"],
  KeyI: ["ិ", "ី", "ឦ", "᧧"],
  KeyO: ["ោ", "ៅ", "", "᧨"],
  KeyP: ["ផ", "ភ", "ឰ", "᧩"],
  BracketLeft: ["ៀ", "ឿ", "ឩ", "᧪"],
  BracketRight: ["ឪ", "ឧ", "ឳ", ""],
  Backslash: ["ឮ", "ឭ", "\\", ""],
  KeyA: ["ា", "ាំ", "", "᧫"],  // Shift+A = ាំ (two code points: ា + ំ)
  KeyS: ["ស", "ៃ", "", "᧬"],
  KeyD: ["ដ", "ឌ", "-", "᧭"],
  KeyF: ["ថ", "ធ", "", "᧮"],
  KeyG: ["ង", "អ", "", "᧯"],
  KeyH: ["ហ", "ះ", "", "᧰"],
  KeyJ: ["្", "ញ", "", "᧱"],  // ្ COENG
  KeyK: ["ក", "គ", "ឝ", "᧲"],
  KeyL: ["ល", "ឡ", ":", "᧳"],
  Semicolon: ["ើ", "ោះ", "៖", "᧴"],
  Quote: ["់", "៉", "ៈ", "᧵"],
  KeyZ: ["ឋ", "ឍ", "", "᧶"],
  KeyX: ["ខ", "ឃ", "", "᧷"],
  KeyC: ["ច", "ជ", "", "᧸"],
  KeyV: ["វ", "េះ", "", "᧹"],
  KeyB: ["ប", "ព", "ឞ", "᧺"],
  KeyN: ["ន", "ណ", "", "᧻"],
  KeyM: ["ម", "ំ", "", "᧼"],
  Comma: ["ុំ", "ុះ", ",", "᧽"],
  Period: ["។", "៕", ".", "᧾"],
  Slash: ["៊", "?", "/", "᧿"],
  Space: ["\u200B", " ", "\u00A0", "\u00A0"],  // NOTE: reversed vs NiDA — base Space emits ZWSP, Shift+Space a real space
};

/* ---------------------------------------------------------------------- *
 * Derived layouts
 * ---------------------------------------------------------------------- */

export interface KeyCap extends PhysicalKey {
  /** Legend printed on the lower half of the cap. */
  base: string;
  /** Legend printed on the upper half (reachable with Shift). */
  shift: string;
  /** Legend reachable with Alt/Option. */
  alt: string;
  /** Legend reachable with Shift+Alt/Option. */
  shiftAlt: string;
  /** Latin reference legend, shown small on Khmer caps so learners can locate keys. */
  reference: string;
  isModifier: boolean;
}

export interface KeyHit {
  code: string;
  /** Whether Shift must be held to produce the character. */
  shift: boolean;
  /** Whether Alt/Option must be held to produce the character. */
  alt: boolean;
  finger: Finger;
  /** The Shift cap to press: always the one opposite the target hand. */
  shiftCode: "ShiftLeft" | "ShiftRight" | null;
  /** The Alt/Option cap to press: likewise the one opposite the target hand. */
  altCode: "AltLeft" | "AltRight" | null;
}

export interface Layout {
  id: LayoutId;
  rows: KeyCap[][];
  /** char (single code point) -> how to type it */
  lookup: Map<string, KeyHit>;
}

const shiftCodeFor = (finger: Finger): "ShiftLeft" | "ShiftRight" =>
  handOf(finger) === "left" ? "ShiftRight" : "ShiftLeft";

const altCodeFor = (finger: Finger): "AltLeft" | "AltRight" =>
  handOf(finger) === "left" ? "AltRight" : "AltLeft";

/**
 * Plane search order. Easiest chord wins, so a character reachable without
 * modifiers is never taught as an Option chord: `ថ` sits on both F (base) and
 * Option+T, and the learner should be sent to F.
 */
const PLANES: { shift: boolean; alt: boolean }[] = [
  { shift: false, alt: false },
  { shift: true, alt: false },
  { shift: false, alt: true },
  { shift: true, alt: true },
];

const legendFor = (cap: KeyCap, shift: boolean, alt: boolean): string =>
  alt ? (shift ? cap.shiftAlt : cap.alt) : shift ? cap.shift : cap.base;

function buildLayout(
  id: LayoutId,
  legends: Record<string, [string, string] | LegendSet>,
): Layout {
  const rows: KeyCap[][] = SKELETON.map((row) =>
    row.map((key) => {
      const [base = "", shift = "", alt = "", shiftAlt = ""] = legends[key.code] ?? [];
      return {
        ...key,
        base,
        shift,
        alt,
        shiftAlt,
        reference: EN_LEGENDS[key.code]?.[0] ?? "",
        isModifier: MODIFIER_CODES.has(key.code),
      };
    }),
  );

  const lookup = new Map<string, KeyHit>();
  for (const plane of PLANES) {
    for (const row of rows) {
      for (const cap of row) {
        const legend = legendFor(cap, plane.shift, plane.alt);
        // Multi-code-point legends are intentionally not indexed: the engine asks
        // for one code point at a time, and each of those code points is reachable
        // on its own cap.
        if (!legend || Array.from(legend).length !== 1) continue;
        if (lookup.has(legend)) continue;
        lookup.set(legend, {
          code: cap.code,
          shift: plane.shift,
          alt: plane.alt,
          finger: cap.finger,
          shiftCode: plane.shift ? shiftCodeFor(cap.finger) : null,
          altCode: plane.alt ? altCodeFor(cap.finger) : null,
        });
      }
    }
  }

  return { id, rows, lookup };
}

export const LAYOUTS: Record<LayoutId, Layout> = {
  en: buildLayout("en", EN_LEGENDS),
  "kh-nida": buildLayout("kh-nida", KH_NIDA_LEGENDS),
  "kh-sbbic": buildLayout("kh-sbbic", KH_SBBIC_LEGENDS),
};

/** code -> cap, per layout. Built once so callers never re-scan the rows. */
const CAP_BY_CODE = Object.fromEntries(
  Object.entries(LAYOUTS).map(([id, layout]) => [
    id,
    new Map(layout.rows.flat().map((cap) => [cap.code, cap])),
  ]),
) as Record<LayoutId, Map<string, KeyCap>>;

/**
 * Resolve which physical key produces `char`.
 * Falls back to the other layout so a stray Latin character inside a Khmer
 * mission (or vice versa) still produces a usable hint.
 */
export function findKey(char: string, layoutId: LayoutId): (KeyHit & { layoutId: LayoutId }) | null {
  const primary = LAYOUTS[layoutId].lookup.get(char);
  if (primary) return { ...primary, layoutId };

  // Stray glyphs still deserve a hint: a Khmer layout falls back to QWERTY, and
  // QWERTY falls back to the government-standard Khmer table.
  const otherId: LayoutId = layoutId === "en" ? "kh-nida" : "en";
  const fallback = LAYOUTS[otherId].lookup.get(char);
  return fallback ? { ...fallback, layoutId: otherId } : null;
}

/**
 * How to describe the keystroke for `char` to a learner: the Latin legend of the
 * physical key, whether Shift is needed, and which finger presses it.
 *
 * Shared by the next-key chip and the in-app guide, so a guide entry can never
 * contradict the key the game actually highlights.
 */
export function physicalKeyLabel(
  char: string,
  layoutId: LayoutId,
): { label: string; shift: boolean; alt: boolean; finger: Finger } | null {
  const hit = findKey(char, layoutId);
  if (!hit) return null;
  const cap = CAP_BY_CODE[hit.layoutId].get(hit.code);
  if (!cap) return null;
  return { label: cap.reference, shift: hit.shift, alt: hit.alt, finger: hit.finger };
}

/** Reorder the bottom row for macOS: Ctrl, Option, Cmd — not Ctrl, Win, Alt. */
export function bottomRowForPlatform(row: KeyCap[], isMac: boolean): KeyCap[] {
  if (!isMac) return row;
  const swap = (a: string, b: string, out: KeyCap[]) => {
    const ia = out.findIndex((c) => c.code === a);
    const ib = out.findIndex((c) => c.code === b);
    if (ia >= 0 && ib >= 0) [out[ia], out[ib]] = [out[ib], out[ia]];
  };
  const out = row.slice();
  swap("MetaLeft", "AltLeft", out);
  swap("MetaRight", "AltRight", out);
  return out;
}

export const FINGER_ORDER: Finger[] = [
  "l-pinky",
  "l-ring",
  "l-middle",
  "l-index",
  "thumb",
  "r-index",
  "r-middle",
  "r-ring",
  "r-pinky",
];

/** Tailwind-free colour tokens; consumed as CSS custom properties. */
export const FINGER_COLOR: Record<Finger, string> = {
  "l-pinky": "var(--finger-pinky)",
  "l-ring": "var(--finger-ring)",
  "l-middle": "var(--finger-middle)",
  "l-index": "var(--finger-index)",
  thumb: "var(--finger-thumb)",
  "r-index": "var(--finger-index)",
  "r-middle": "var(--finger-middle)",
  "r-ring": "var(--finger-ring)",
  "r-pinky": "var(--finger-pinky)",
};
