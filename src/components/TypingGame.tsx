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
import { MISSIONS, nextMissionId, type Mission } from "@/lib/missions";
import { sfx } from "@/lib/sfx";
import { STORAGE_KEYS, readJson, readStorage, writeJson, writeStorage } from "@/lib/storage";

import { CustomLessonDialog } from "./CustomLessonDialog";
import { GameArena } from "./GameArena";
import { HandGuide } from "./HandGuide";
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
  onHelp,
}: {
  mission: Mission;
  best: number | null;
  hasNext: boolean;
  onCleared: (wpm: number) => void;
  onRetry: () => void;
  onNext: () => void;
  onExit: () => void;
  onHelp: () => void;
}) {
  const { t, lang, toggleLang, theme, toggleTheme, soundOn, toggleSound, khmerLayout } = useApp();
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
    <div className="flex h-full flex-col justify-between gap-1.5 sm:gap-2 overflow-hidden select-none">
      {/* Integrated Game Top Bar: Slim, single row */}
      <div className="flex items-center justify-between gap-2 shrink-0 py-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <PixelButton onClick={onExit} tone="primary">
            <span aria-hidden="true">← </span>
            <span className="hidden sm:inline">{t("game.back")}</span>
          </PixelButton>

          <div className="flex items-center gap-1.5 truncate">
            <span className="text-base sm:text-lg leading-none" aria-hidden="true">
              {mission.badge}
            </span>
            <h2
              className={[
                "text-xs sm:text-sm font-bold text-[var(--ink)] truncate",
                mission.script === "kh" ? "font-khmer" : "font-retro",
              ].join(" ")}
            >
              {mission.title || t(`missions.${mission.id}.title`)}
            </h2>
            <span className="hidden md:inline-block rounded border border-[var(--panel-edge)] bg-[var(--key-face)] px-1.5 py-0.5 text-[8.5px] font-bold uppercase text-[var(--ink-soft)]">
              {t("missions.targetWpm", { wpm: mission.targetWpm })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <PixelButton onClick={onRetry} tone="coin" title={t("game.restart")}>
            <span aria-hidden="true">⟳ </span>
            <span className="hidden sm:inline">{t("game.restart")}</span>
          </PixelButton>

          <PixelButton
            onClick={toggleSound}
            aria-label={soundOn ? t("nav.soundOff") : t("nav.soundOn")}
            title={soundOn ? t("nav.soundOff") : t("nav.soundOn")}
          >
            {soundOn ? "🔊" : "🔇"}
          </PixelButton>

          <PixelButton
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
            title={theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
          >
            {theme === "dark" ? "☀" : "☾"}
          </PixelButton>

          <PixelButton
            tone="primary"
            onClick={toggleLang}
            aria-label={t("nav.switchTo")}
            title={t("nav.switchTo")}
          >
            <span className={lang === "en" ? "font-khmer" : ""}>
              {lang === "en" ? "ខ្មែរ" : "EN"}
            </span>
          </PixelButton>

          <PixelButton onClick={onHelp} aria-label={t("nav.help")} title={t("nav.help")}>
            ?
          </PixelButton>
        </div>
      </div>

      {/* 9-Stat Arcade HUD */}
      <Hud engine={engine} />

      {/* Arena + Text to type */}
      <GameArena engine={engine} mission={mission} layoutId={layoutId} onExit={onExit} />

      {/* Virtual Keyboard + Hand Guide */}
      <section className="pixel-panel flex flex-col gap-1 sm:gap-1.5 rounded-md p-2 sm:p-2.5 shrink-0">
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <h3 className="font-retro text-[9px] sm:text-[10px] text-[var(--ink)]">{t("keyboard.heading")}</h3>
          <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
            {mission.script === "kh" ? t(`keyboard.${khmerLayout}`) : t("keyboard.layoutEn")} ·{" "}
            {t("keyboard.hint")}
          </span>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <VirtualKeyboard layoutId={layoutId} target={engine.expected} />
          </div>
          <div className="shrink-0 lg:w-48 xl:w-56">
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
  const [mission, setMission] = useState<Mission | null>(null);
  const [cleared, setCleared] = useState<ReadonlySet<string>>(() => new Set());
  const [bests, setBests] = useState<Readonly<Record<string, number>>>(() => ({}));
  const [customMissions, setCustomMissions] = useState<Mission[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [runNonce, setRunNonce] = useState(0);

  // Hydrate saved progress & custom missions after mount (localStorage is client-only).
  useEffect(() => {
    setCleared(new Set(readJson<string[]>(STORAGE_KEYS.cleared, [])));
    const loadedCustom = readJson<Mission[]>(STORAGE_KEYS.customMissions, []);
    setCustomMissions(loadedCustom);

    const scores: Record<string, number> = {};
    for (const m of [...MISSIONS, ...loadedCustom]) {
      const raw = readStorage(STORAGE_KEYS.best(m.id));
      if (raw !== null) {
        const n = Number(raw);
        if (Number.isFinite(n)) scores[m.id] = n;
      }
    }
    setBests(scores);
  }, []);

  const handleSelect = useCallback((m: Mission) => {
    setMission(m);
    setRunNonce((n) => n + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setRunNonce((n) => n + 1);
  }, []);

  const handleExit = useCallback(() => {
    setMission(null);
  }, []);

  const handleNext = useCallback(() => {
    if (!mission) return;
    const nextId = nextMissionId(mission.id);
    if (!nextId) {
      setMission(null);
      return;
    }
    const next = MISSIONS.find((m) => m.id === nextId);
    if (next) {
      setMission(next);
      setRunNonce((n) => n + 1);
    } else {
      setMission(null);
    }
  }, [mission]);

  const handleCleared = useCallback(
    (wpm: number) => {
      if (!mission) return;
      setCleared((prev) => {
        if (prev.has(mission.id)) return prev;
        const next = new Set(prev).add(mission.id);
        writeJson(STORAGE_KEYS.cleared, Array.from(next));
        return next;
      });
      setBests((prev) => {
        const current = prev[mission.id] ?? 0;
        if (wpm <= current) return prev;
        writeStorage(STORAGE_KEYS.best(mission.id), String(wpm));
        return { ...prev, [mission.id]: wpm };
      });
    },
    [mission],
  );

  const handleSaveCustom = useCallback(
    (newMission: Mission, autoPlay = false) => {
      setCustomMissions((prev) => {
        const updated = [newMission, ...prev];
        writeJson(STORAGE_KEYS.customMissions, updated);
        return updated;
      });
      setCustomModalOpen(false);
      if (autoPlay) {
        setMission(newMission);
        setRunNonce((n) => n + 1);
      }
    },
    [],
  );

  const handleDeleteCustom = useCallback((id: string) => {
    setCustomMissions((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      writeJson(STORAGE_KEYS.customMissions, updated);
      return updated;
    });
    sfx.play("bump");
  }, []);

  // Single-screen locked viewport during gameplay:
  // Arena, text, and virtual keyboard fit completely into 100vh with NO vertical scrolling!
  if (mission) {
    return (
      <div className="mx-auto flex h-dvh max-h-dvh w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px] flex-col justify-between p-2 sm:p-3 md:p-3.5 overflow-hidden">
        <main className="h-full flex-1 overflow-hidden">
          <MissionRunner
            key={`${mission.id}:${runNonce}`}
            mission={mission}
            best={bests[mission.id] ?? null}
            hasNext={nextMissionId(mission.id) !== null}
            onCleared={handleCleared}
            onRetry={handleRetry}
            onNext={handleNext}
            onExit={handleExit}
            onHelp={() => setHelpOpen(true)}
          />
        </main>
        <GuideDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    );
  }

  // Standard scrollable view for Mission Selector and FAQs:
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px] flex-col gap-5 lg:gap-6 p-4 sm:p-6 lg:p-8">
      <Header onHelp={() => setHelpOpen(true)} />

      <main className="flex-1">
        <MissionSelect
          cleared={cleared}
          bests={bests}
          customMissions={customMissions}
          onSelect={handleSelect}
          onHelp={() => setHelpOpen(true)}
          onCreateCustom={() => setCustomModalOpen(true)}
          onDeleteCustom={handleDeleteCustom}
        />
      </main>

      <SeoGuide />

      <footer className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        <span>{t("footer.note")}</span>
        <span>{t("app.tagline")}</span>
      </footer>

      <GuideDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <CustomLessonDialog
        open={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onSave={handleSaveCustom}
      />
    </div>
  );
}
