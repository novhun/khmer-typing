"use client";

/** Retro status bar: score, coins, lives, live speed/accuracy and progress. */

import { memo } from "react";

import { useApp } from "@/context/AppProviders";
import type { TypingEngine } from "@/hooks/useTypingEngine";

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "bad" | "coin";
}) {
  const toneClass =
    tone === "good"
      ? "text-[var(--hit)]"
      : tone === "bad"
        ? "text-[var(--miss)]"
        : tone === "coin"
          ? "text-[var(--coin)]"
          : "text-[var(--ink)]";

  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-[var(--panel-edge)]/50 bg-[var(--key-face)]/60 px-1 py-0.5 sm:py-1 text-center transition-all">
      <span className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
        {label}
      </span>
      <span className={`font-retro text-[10px] sm:text-[11px] lg:text-[12px] leading-tight ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}

const formatTime = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export const Hud = memo(function Hud({ engine }: { engine: TypingEngine }) {
  const { t } = useApp();

  return (
    <div className="pixel-panel flex flex-col gap-1 sm:gap-1.5 rounded-md p-1.5 sm:p-2 shrink-0">
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 sm:gap-1.5">
        <Stat label={t("hud.score")} value={String(engine.score).padStart(6, "0")} />
        <Stat label={t("hud.coins")} value={`🪙 ${engine.coins}`} tone="coin" />

        <div className="flex flex-col items-center justify-center rounded-sm border border-[var(--panel-edge)]/50 bg-[var(--key-face)]/60 px-1 py-0.5 text-center transition-all">
          <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
            {t("hud.lives")}
          </span>
          <div className="flex gap-0.5 text-[10px] sm:text-[11px] leading-tight" aria-label={`${engine.lives}`}>
            {Array.from({ length: engine.maxLives }, (_, i) => (
              <span key={i} className={i < engine.lives ? "inline-block" : "opacity-25 grayscale"}>
                🍄
              </span>
            ))}
          </div>
        </div>

        <Stat label={t("hud.wpm")} value={String(engine.wpm)} tone="good" />
        <Stat label={t("hud.cpm")} value={String(engine.cpm)} />
        <Stat
          label={t("hud.accuracy")}
          value={`${engine.accuracy}%`}
          tone={engine.accuracy >= 95 ? "good" : engine.accuracy >= 80 ? "default" : "bad"}
        />
        <Stat label={t("hud.time")} value={formatTime(engine.elapsedMs)} />
        <Stat
          label={t("hud.combo")}
          value={engine.combo > 0 ? `${engine.combo}×${engine.multiplier}` : "—"}
          tone={engine.multiplier > 1 ? "coin" : "default"}
        />
        <Stat label={t("hud.errors")} value={String(engine.errors)} tone={engine.errors ? "bad" : "default"} />
      </div>

      {/* Mission progress — the same value that positions the hero in the arena. */}
      <div className="flex items-center gap-2">
        <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
          {t("hud.progress")}
        </span>
        <div
          className="h-2 flex-1 overflow-hidden rounded-sm border border-[var(--panel-edge)] bg-[var(--key-face)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(engine.missionProgress * 100)}
        >
          <div
            className="h-full bg-[var(--coin)] transition-[width] duration-150 ease-out"
            style={{ width: `${engine.missionProgress * 100}%` }}
          />
        </div>
        <span className="font-retro text-[8.5px] text-[var(--ink-soft)]">
          {t("game.lineOf", { current: engine.lineIndex + 1, total: engine.lineCount })}
        </span>
      </div>
    </div>
  );
});
