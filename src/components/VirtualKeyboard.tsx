"use client";

/**
 * On-screen keyboard that highlights the next keystroke in real time.
 *
 * Feedback layers:
 *   1. TARGET     — the cap that produces the expected character (pulsing ring).
 *   2. CHORD HINT — the *opposite-hand* Shift and/or Alt-Option caps, whenever
 *                   the target needs them. Khmer needs this badly: every Latin
 *                   symbol on the layout is an Option chord (Option+4 = $), and
 *                   the fourth plane is a three-key chord (Shift+Option+1 = …).
 *   3. PRESSED    — live `keydown`/`keyup` mirroring, so learners can see when
 *                   they hit a neighbouring key.
 *
 * Marked `aria-hidden`: it is a visual aid, and the authoritative next-key
 * announcement is made by <NextKeyChip> in a polite live region.
 */

import { memo, useEffect, useMemo, useState } from "react";

import { useApp } from "@/context/AppProviders";
import { displayGlyph, isCombiningMark, isDependentVowel } from "@/lib/khmer";
import {
  FINGER_COLOR,
  LAYOUTS,
  bottomRowForPlatform,
  findKey,
  type KeyCap,
  type LayoutId,
} from "@/lib/keyboard";

/** Total key units per row — every row of a 60% ANSI board is exactly 15u. */
const ROW_UNITS = 15;

interface VirtualKeyboardProps {
  layoutId: LayoutId;
  /** The code point the learner must type next, or null when the line is done. */
  target: string | null;
}

function KeyCapView({
  cap,
  isTarget,
  isChordHint,
  isPressed,
  labelOverride,
}: {
  cap: KeyCap;
  isTarget: boolean;
  /** This cap is a modifier the target chord requires. */
  isChordHint: boolean;
  isPressed: boolean;
  labelOverride?: string;
}) {
  // All four planes are shown, each in a fixed position, the way multi-layer
  // keycaps are actually printed:
  //     Shift ↖            ↗ Shift+Alt
  //              base
  //     ref   ↙            ↘ Alt
  // Every glyph therefore has one place to look, and nothing is hidden.
  const blank = (v: string) => !v || v === " " || v === "\u00A0";
  const shiftGlyph = !blank(cap.shift) && cap.shift !== cap.base ? displayGlyph(cap.shift) : "";
  const baseGlyph = !blank(cap.base) ? displayGlyph(cap.base) : "";
  const altGlyph = !blank(cap.alt) ? displayGlyph(cap.alt) : "";
  const shiftAltGlyph =
    !blank(cap.shiftAlt) && cap.shiftAlt !== cap.alt ? displayGlyph(cap.shiftAlt) : "";
  // Combining marks are rendered on a dotted circle, which needs more room.
  const isMark = cap.base ? isDependentVowel(cap.base) || isCombiningMark(cap.base) : false;

  return (
    <div
      style={{
        flex: `0 1 ${(((cap.unit ?? 1) / ROW_UNITS) * 100).toFixed(4)}%`,
        borderBottomColor: FINGER_COLOR[cap.finger],
      }}
      className={[
        "relative flex min-w-0 select-none flex-col items-center justify-center",
        "min-h-[46px] rounded-[4px] border-b-[3px] py-1 text-[var(--key-ink)] sm:min-h-[54px] sm:py-1.5",
        "border-2 border-t-0 border-l-0 border-r-0 transition-transform duration-75",
        isTarget
          ? "anim-pulse z-10 scale-[1.14] bg-[var(--coin)] text-[#1b1b2f] ring-[3px] ring-[var(--panel-edge)]"
          : isChordHint
            ? "bg-[color-mix(in_srgb,var(--coin)_35%,var(--key-face))] ring-2 ring-[var(--coin)]"
            : "bg-[var(--key-face)]",
        isPressed && !isTarget ? "translate-y-[2px] brightness-90" : "",
        cap.home && !isTarget ? "shadow-[inset_0_-3px_0_0_color-mix(in_srgb,var(--key-ink)_25%,transparent)]" : "",
      ].join(" ")}
      title={[cap.base, cap.shift, cap.alt, cap.shiftAlt].filter(Boolean).join("  ")}
    >
      {labelOverride ? (
        <span className="truncate px-1 text-[8px] font-bold uppercase tracking-tight sm:text-[9px]">
          {labelOverride}
        </span>
      ) : (
        <>
          {/* ↖ Shift */}
          {shiftGlyph ? (
            <span className="font-khmer pointer-events-none absolute left-1 top-0.5 text-[9px] leading-none opacity-65 sm:text-[10px]">
              {shiftGlyph}
            </span>
          ) : null}
          {/* ↗ Shift+Alt — tinted, so the Alt planes read as one family */}
          {shiftAltGlyph ? (
            <span className="font-khmer pointer-events-none absolute right-1 top-0.5 text-[9px] leading-none text-[var(--alt-ink)] opacity-90 sm:text-[10px]">
              {shiftAltGlyph}
            </span>
          ) : null}
          <span
            className={[
              "font-khmer leading-none",
              isMark ? "text-[14px] sm:text-[17px]" : "text-[14px] sm:text-[18px]",
              shiftGlyph ? "mt-2" : "",
            ].join(" ")}
          >
            {baseGlyph || " "}
          </span>
          {/* Latin reference legend: lets a learner find the physical key while
              their eyes are still learning the Khmer glyphs. */}
          {cap.reference && cap.reference !== cap.base ? (
            <span className="pointer-events-none absolute bottom-0 left-1 text-[7px] uppercase leading-none opacity-40 sm:text-[8px]">
              {cap.reference}
            </span>
          ) : null}
          {/* ↘ Alt / Option */}
          {altGlyph ? (
            <span className="font-khmer pointer-events-none absolute bottom-0 right-1 text-[9px] leading-none text-[var(--alt-ink)] sm:text-[10px]">
              {altGlyph}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}

function VirtualKeyboardImpl({ layoutId, target }: VirtualKeyboardProps) {
  const { t, isMac } = useApp();
  const [pressed, setPressed] = useState<ReadonlySet<string>>(() => new Set());

  // Mirror the physical keyboard. Listeners are passive and never preventDefault
  // — the capture <textarea> in the arena owns real input handling.
  useEffect(() => {
    const down = (e: KeyboardEvent) =>
      setPressed((prev) => (prev.has(e.code) ? prev : new Set(prev).add(e.code)));
    const up = (e: KeyboardEvent) =>
      setPressed((prev) => {
        if (!prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    // Releasing a key while the tab is hidden never fires keyup — clear on blur.
    const clear = () => setPressed(new Set());

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  const hit = useMemo(() => (target ? findKey(target, layoutId) : null), [target, layoutId]);

  // Every modifier the current chord needs, so a three-key chord such as
  // Shift+Option+1 lights all three caps at once.
  const chordCodes = useMemo(() => {
    const codes = new Set<string>();
    if (hit?.shiftCode) codes.add(hit.shiftCode);
    if (hit?.altCode) codes.add(hit.altCode);
    return codes;
  }, [hit]);

  const rows = useMemo(() => {
    const source = LAYOUTS[layoutId].rows;
    return source.map((row, i) =>
      i === source.length - 1 ? bottomRowForPlatform(row, isMac) : row,
    );
  }, [layoutId, isMac]);

  const modifierLabels: Record<string, string> = useMemo(
    () => ({
      Backspace: t("keyboard.backspace"),
      Tab: t("keyboard.tab"),
      CapsLock: t("keyboard.caps"),
      Enter: t("keyboard.enter"),
      ShiftLeft: t("keyboard.shift"),
      ShiftRight: t("keyboard.shift"),
      Space: t("keyboard.space"),
      ControlLeft: t("keyboard.ctrl"),
      ControlRight: t("keyboard.ctrl"),
      // Option on Apple keyboards, AltGr/Alt elsewhere.
      AltLeft: isMac ? t("keyboard.option") : t("keyboard.alt"),
      AltRight: isMac ? t("keyboard.option") : t("keyboard.alt"),
      MetaLeft: isMac ? t("keyboard.cmd") : t("keyboard.meta"),
      MetaRight: isMac ? t("keyboard.cmd") : t("keyboard.meta"),
    }),
    [t, isMac],
  );

  return (
    <div aria-hidden="true" className="flex flex-col gap-1 sm:gap-1.5">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1 sm:gap-1.5"
        >
          {row.map((cap) => (
            <KeyCapView
              cap={cap}
              isTarget={hit?.code === cap.code}
              isChordHint={chordCodes.has(cap.code)}
              isPressed={pressed.has(cap.code)}
              labelOverride={
                cap.isModifier || cap.code === "Space" ? modifierLabels[cap.code] : undefined
              }
              key={cap.code}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Memoised: the keyboard only depends on the layout and the target character. */
export const VirtualKeyboard = memo(VirtualKeyboardImpl);
