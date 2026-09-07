"use client";

/**
 * "Type this next" chip — the authoritative, screen-reader-visible instruction.
 *
 * Combining marks and invisible characters are the hard case: U+17D2 COENG has
 * no advance width and U+200B ZWSP has no glyph at all, so both are rendered
 * through `displayGlyph()` (dotted-circle base / a visible stand-in) and named
 * in the learner's own language.
 */

import { memo } from "react";

import { useApp } from "@/context/AppProviders";
import { charNameKey, displayGlyph } from "@/lib/khmer";
import { physicalKeyLabel, type LayoutId } from "@/lib/keyboard";

export const NextKeyChip = memo(function NextKeyChip({
  target,
  layoutId,
}: {
  target: string | null;
  layoutId: LayoutId;
}) {
  const { t, isMac } = useApp();

  if (!target) return null;

  const nameKey = charNameKey(target);
  // The Latin legend of the physical key, so "press K" is actionable even when
  // the learner cannot yet read the Khmer glyph.
  const hit = physicalKeyLabel(target, layoutId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
        {t("game.nextKey")}
      </span>

      <div className="pixel-panel flex items-center gap-2 rounded-md px-3 py-1.5">
        <span className="font-khmer text-2xl leading-none" aria-hidden="true">
          {displayGlyph(target)}
        </span>
        {hit ? (
          <kbd className="rounded border-2 border-[var(--panel-edge)] bg-[var(--key-face)] px-1.5 py-0.5 font-retro text-[10px] uppercase text-[var(--key-ink)]">
            {hit.label === " " ? t("keyboard.space") : hit.label}
          </kbd>
        ) : null}
        {/* Modifiers first, in the order they are pressed. */}
        {hit?.alt ? (
          <span className="font-retro text-[9px] text-[var(--coin)]">
            {isMac ? t("game.useOption") : t("game.useAlt")}
          </span>
        ) : null}
        {hit?.shift ? (
          <span className="font-retro text-[9px] text-[var(--coin)]">{t("game.useShift")}</span>
        ) : null}
      </div>

      {nameKey ? (
        <span className="text-[11px] font-semibold text-[var(--ink-soft)]">{t(nameKey)}</span>
      ) : null}

      {/* Announced once per character change, without stealing focus. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {t("game.nextKey")}: {nameKey ? t(nameKey) : target}
        {hit?.alt ? `, ${isMac ? t("game.useOption") : t("game.useAlt")}` : ""}
        {hit?.shift ? `, ${t("game.useShift")}` : ""}
      </span>
    </div>
  );
});
