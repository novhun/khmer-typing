"use client";

/**
 * Chooses which Khmer key table to teach.
 *
 * This is not a cosmetic preference. The two layouts Cambodia actually uses
 * disagree on 82 of 192 key positions — ឯ is Shift+/ on NiDA but Option+E on
 * SBBIC, and the Space bar itself is reversed — so a wrong setting means every
 * finger hint is wrong.
 */

import { useApp } from "@/context/AppProviders";
import { KHMER_LAYOUTS } from "@/lib/keyboard";

export function LayoutPicker() {
  const { t, khmerLayout, setKhmerLayout } = useApp();

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
        {t("keyboard.layoutPick")}
      </span>
      <div
        role="radiogroup"
        aria-label={t("keyboard.layoutPick")}
        className="flex overflow-hidden rounded-sm border-2 border-[var(--panel-edge)]"
      >
        {KHMER_LAYOUTS.map((id) => {
          const active = khmerLayout === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setKhmerLayout(id)}
              className={[
                "focus-ring px-2 py-1 text-[10px] font-bold transition-colors",
                active
                  ? "bg-[var(--coin)] text-[#1b1b2f]"
                  : "bg-[var(--key-face)] text-[var(--key-ink)] hover:brightness-105",
              ].join(" ")}
            >
              {t(`keyboard.${id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
