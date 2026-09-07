"use client";

/**
 * Top-level client orchestrator.
 *
 * Split into two components on purpose:
 *   • <TypingGame>    owns navigation and persisted progress.
 *   • <MissionRunner> owns one run, and is *remounted* (via `key`) on retry, so
 *     "try again" resets the engine, animations and timers with zero chance of
 *     stale state — cheaper to reason about than a manual reset cascade.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { useApp } from "@/context/AppProviders";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { findKey, resolveLayout } from "@/lib/keyboard";
import { MISSIONS, MISSION_BY_ID, nextMissionId, type Mission } from "@/lib/missions";
import { sfx } from "@/lib/sfx";
import { STORAGE_KEYS, readJson, readStorage, writeJson, writeStorage } from "@/lib/storage";

import { GameArena } from "./GameArena";
import { HandGuide } from "./HandGuide";
import { LayoutPicker } from "./LayoutPicker";
import { Header } from "./Header";
import { GuideDialog } from "./GuideDialog";
import { Hud } from "./Hud";
import { MissionSelect } from "./MissionSelect";
import { PixelButton } from "./PixelButton";
import { ResultOverlay } from "./ResultOverlay";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { SeoGuide } from "./SeoGuide";

/* ---------------------------------------------------------------------- *
 * One run
 * ---------------------------------------------------------------------- */

function MissionRunner({
  mission,
  best,
  hasNext,
  onCleared,
  onRetry,
  onNext,
  onExit,
}: {
  mission: Mission;
  best: number | null;
  hasNext: boolean;
  onCleared: (wpm: number) => void;
  onRetry: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const { t, khmerLayout } = useApp();
  const engine = useTypingEngine(mission);
  // A Khmer mission renders whichever key table the learner selected.
  const layoutId = resolveLayout(mission.script, khmerLayout);
  const [recorded, setRecorded] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  // Record the clear exactly once per mounted run.
  useEffect(() => {
    if (engine.status !== "won" || recorded) return;
    setRecorded(true);
    setIsNewBest(engine.wpm > (best ?? 0));
    onCleared(engine.wpm);
  }, [engine.status, engine.wpm, recorded, best, onCleared]);

  const finger = useMemo(() => {
    if (!engine.expected) return null;
    return findKey(engine.expected, layoutId)?.finger ?? null;
  }, [engine.expected, layoutId]);

  const finished = engine.status === "won" || engine.status === "lost";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          className={[
            "text-base font-bold text-[var(--ink)]",
            mission.script === "kh" ? "font-khmer" : "",
          ].join(" ")}
        >
          <span className="mr-2" aria-hidden="true">
            {mission.badge}
          </span>
          {t(`missions.${mission.id}.title`)}
        </h2>
        <div className="flex gap-2">
          <PixelButton onClick={onRetry}>{t("game.restart")}</PixelButton>
          <PixelButton onClick={onExit}>{t("game.back")}</PixelButton>
        </div>
      </div>

      <Hud engine={engine} />

      <GameArena engine={engine} mission={mission} layoutId={layoutId} onExit={onExit} />

      {/* Keyboard + finger HUD */}
      <section className="pixel-panel flex flex-col gap-3 rounded-md p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-retro text-[10px] text-[var(--ink)]">{t("keyboard.heading")}</h3>
          {/* Only Khmer missions have two possible key tables to choose between. */}
          {mission.script === "kh" ? (
            <LayoutPicker />
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
              {t("keyboard.layoutEn")}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
          {t("keyboard.hint")}
          {mission.script === "kh" ? ` · ${t("keyboard.planeHint")}` : ""}
        </p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <VirtualKeyboard layoutId={layoutId} target={engine.expected} />
          </div>
          <div className="shrink-0 lg:w-56">
            <HandGuide finger={finger} />
          </div>
        </div>
      </section>

      {finished ? (
        <ResultOverlay
          engine={engine}
          mission={mission}
          hasNext={hasNext}
          isNewBest={isNewBest}
          best={best}
          onRetry={onRetry}
          onNext={onNext}
          onMenu={onExit}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 * Shell
 * ---------------------------------------------------------------------- */

export function TypingGame() {
  const { t } = useApp();
  const [missionId, setMissionId] = useState<string | null>(null);
  const [cleared, setCleared] = useState<ReadonlySet<string>>(() => new Set<string>());
  const [bests, setBests] = useState<Readonly<Record<string, number>>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  /** Bumped on retry to remount <MissionRunner>. */
  const [runNonce, setRunNonce] = useState(0);

  // Hydrate saved progress after mount (localStorage is client-only).
  useEffect(() => {
    setCleared(new Set(readJson<string[]>(STORAGE_KEYS.cleared, [])));
    const loaded: Record<string, number> = {};
    for (const mission of MISSIONS) {
      const raw = readStorage(STORAGE_KEYS.best(mission.id));
      const value = raw === null ? NaN : Number(raw);
      if (Number.isFinite(value)) loaded[mission.id] = value;
    }
    setBests(loaded);
  }, []);

  const mission = missionId ? (MISSION_BY_ID.get(missionId) ?? null) : null;

  const handleCleared = useCallback(
    (wpm: number) => {
      if (!missionId) return;

      setCleared((prev) => {
        if (prev.has(missionId)) return prev;
        const next = new Set(prev).add(missionId);
        writeJson(STORAGE_KEYS.cleared, [...next]);
        return next;
      });

      setBests((prev) => {
        if (wpm <= (prev[missionId] ?? 0)) return prev;
        writeStorage(STORAGE_KEYS.best(missionId), String(wpm));
        return { ...prev, [missionId]: wpm };
      });
    },
    [missionId],
  );

  const handleSelect = useCallback((next: Mission) => {
    setMissionId(next.id);
    setRunNonce((n) => n + 1);
  }, []);

  const handleNext = useCallback(() => {
    if (!missionId) return;
    const next = nextMissionId(missionId);
    if (!next) {
      setMissionId(null);
      return;
    }
    sfx.play("levelup");
    setMissionId(next);
    setRunNonce((n) => n + 1);
  }, [missionId]);

  const handleExit = useCallback(() => setMissionId(null), []);
  const handleRetry = useCallback(() => setRunNonce((n) => n + 1), []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-5 p-4 sm:p-6">
      <Header onHelp={() => setHelpOpen(true)} />

      <main className="flex-1">
        {mission ? (
          <MissionRunner
            key={`${mission.id}:${runNonce}`}
            mission={mission}
            best={bests[mission.id] ?? null}
            hasNext={nextMissionId(mission.id) !== null}
            onCleared={handleCleared}
            onRetry={handleRetry}
            onNext={handleNext}
            onExit={handleExit}
          />
        ) : (
          <MissionSelect
            cleared={cleared}
            bests={bests}
            onSelect={handleSelect}
            onHelp={() => setHelpOpen(true)}
          />
        )}
      </main>

      <SeoGuide />

      <footer className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        <span>{t("footer.note")}</span>
        <span>{t("app.tagline")}</span>
      </footer>

      <GuideDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
