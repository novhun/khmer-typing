"use client";

/** End-of-run panel: win or lose, the run's numbers, and where to go next. */

import { useApp } from "@/context/AppProviders";
import type { TypingEngine } from "@/hooks/useTypingEngine";
import type { Mission } from "@/lib/missions";
import { PixelButton } from "./PixelButton";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--key-edge)] py-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
        {label}
      </span>
      <span className="font-retro text-[11px] text-[var(--ink)]">{value}</span>
    </div>
  );
}

export function ResultOverlay({
  engine,
  mission,
  hasNext,
  isNewBest,
  best,
  onRetry,
  onNext,
  onMenu,
}: {
  engine: TypingEngine;
  mission: Mission;
  hasNext: boolean;
  isNewBest: boolean;
  best: number | null;
  onRetry: () => void;
  onNext: () => void;
  onMenu: () => void;
}) {
  const { t } = useApp();
  const won = engine.status === "won";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="pixel-panel w-full max-w-sm rounded-md p-5"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            {won ? "🏁" : "💀"}
          </span>
          <h2 id="result-title" className="font-retro text-[13px] text-[var(--ink)]">
            {won ? t("result.winTitle") : t("result.loseTitle")}
          </h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
          {won
            ? t("result.winBody", { mission: t(`missions.${mission.id}.title`) })
            : t("result.loseBody")}
        </p>

        {isNewBest ? (
          <p className="anim-pop mt-3 rounded-sm border-2 border-[var(--coin)] bg-[color-mix(in_srgb,var(--coin)_22%,transparent)] px-2 py-1 font-retro text-[10px]">
            🏆 {t("result.newBest")}
          </p>
        ) : null}

        <div className="mt-4">
          <Row label={t("hud.wpm")} value={String(engine.wpm)} />
          <Row label={t("hud.cpm")} value={String(engine.cpm)} />
          <Row label={t("hud.accuracy")} value={`${engine.accuracy}%`} />
          <Row label={t("hud.score")} value={String(engine.score)} />
          <Row label={t("hud.coins")} value={String(engine.coins)} />
          <Row label={t("hud.combo")} value={String(engine.maxCombo)} />
          <Row label={t("hud.errors")} value={String(engine.errors)} />
          {best !== null ? <Row label={t("result.best")} value={`${best} ${t("hud.wpm")}`} /> : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <PixelButton tone="coin" onClick={onRetry} autoFocus>
            {t("result.again")}
          </PixelButton>
          {won && hasNext ? (
            <PixelButton tone="primary" onClick={onNext}>
              {t("result.next")}
            </PixelButton>
          ) : null}
          <PixelButton onClick={onMenu}>{t("result.menu")}</PixelButton>
        </div>
      </div>
    </div>
  );
}
