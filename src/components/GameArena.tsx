"use client";

/**
 * The Mario-style arena: parallax sky, brick ground, a hero that advances with
 * mission progress, Goombas that creep closer with every miss, and the drill
 * text itself.
 *
 * Every sprite is composed from plain divs and CSS gradients — the project ships
 * zero image assets, so there is nothing to load, cache-bust or lazy-import.
 *
 * INPUT CAPTURE (the subtle part): a transparent <textarea> overlays the text
 * panel. We cancel the DOM `beforeinput` event and read `event.data` instead of
 * letting characters land in the field. That is what makes multi-code-point
 * keystrokes work — one press on a Khmer layout can insert two code points, and
 * `keydown`/`event.key` cannot represent that reliably. An `input` fallback
 * covers engines that do not honour a cancelled `beforeinput`.
 *
 * The listener is attached natively rather than through React's `onBeforeInput`
 * prop ON PURPOSE: React's version is a legacy *synthesised* event whose
 * `nativeEvent` carries no `inputType`, so it cannot distinguish typing from
 * pasting. That distinction matters — without it a single paste would satisfy an
 * entire drill instantly and bank a meaningless WPM as a personal best. Only
 * real typing and IME composition are accepted, each insertion length-capped,
 * because no keystroke on any layout produces more than a couple of code points.
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useApp } from "@/context/AppProviders";
import type { TypingEngine } from "@/hooks/useTypingEngine";
import { displayGlyph, toCodePoints } from "@/lib/khmer";
import type { Finger, LayoutId } from "@/lib/keyboard";
import type { Mission } from "@/lib/missions";
import { HandGuide } from "./HandGuide";
import { NextKeyChip } from "./NextKeyChip";

/* ---------------------------------------------------------------------- *
 * Sprites
 * ---------------------------------------------------------------------- */

/** Plumber-ish hero: cap, moustache, overalls, boots. ~10 divs. */
const Hero = memo(function Hero() {
  return (
    <div className="relative h-11 w-8 sm:h-12 sm:w-9" aria-hidden="true">
      <div className="absolute left-1 top-0 h-2 w-7 rounded-t-[3px] bg-[#e23b2e]" />
      <div className="absolute left-0 top-2 h-1 w-9 bg-[#e23b2e]" />
      <div className="absolute left-1.5 top-3 h-4 w-6 bg-[#f2c395]" />
      <div className="absolute left-5 top-[0.95rem] h-1 w-1 bg-[#2b1a10]" />
      <div className="absolute left-2.5 top-[1.55rem] h-1 w-4 rounded-sm bg-[#2b1a10]" />
      <div className="absolute left-1 top-[1.85rem] h-3.5 w-7 rounded-sm bg-[#2f6fd0]" />
      <div className="absolute left-0 top-[2rem] h-2 w-2 rounded-sm bg-[#e23b2e]" />
      <div className="absolute right-0 top-[2rem] h-2 w-2 rounded-sm bg-[#e23b2e]" />
      <div className="absolute bottom-0 left-0.5 h-1.5 w-3.5 rounded-sm bg-[#5a3312]" />
      <div className="absolute bottom-0 right-0.5 h-1.5 w-3.5 rounded-sm bg-[#5a3312]" />
    </div>
  );
});

const Goomba = memo(function Goomba() {
  return (
    <div className="relative h-6 w-6 sm:h-7 sm:w-7 anim-bob" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-5 rounded-t-full bg-[#8b4a20]" />
      <div className="absolute left-1 top-2 h-1.5 w-1.5 rounded-sm bg-white" />
      <div className="absolute right-1 top-2 h-1.5 w-1.5 rounded-sm bg-white" />
      <div className="absolute left-[0.4rem] top-[0.6rem] h-1 w-0.5 bg-[#2b1a10]" />
      <div className="absolute right-[0.4rem] top-[0.6rem] h-1 w-0.5 bg-[#2b1a10]" />
      <div className="absolute inset-x-0 bottom-0 h-2 rounded-b-[3px] bg-[#f0d9a8]" />
    </div>
  );
});

const Flag = memo(function Flag({ raised }: { raised: boolean }) {
  return (
    <div className="relative h-18 sm:h-20 w-8" aria-hidden="true">
      <div className="absolute bottom-0 left-3 h-18 sm:h-20 w-1 bg-[#c0c0c8]" />
      <div className="absolute left-3 top-0 h-1.5 w-1.5 rounded-full bg-[var(--coin)]" />
      <div
        className={[
          "absolute left-4 h-3.5 w-4.5 anim-flag",
          raised ? "top-1 bg-[var(--coin)]" : "top-4 bg-[#e23b2e]",
        ].join(" ")}
        style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
      />
    </div>
  );
});

const Cloud = memo(function Cloud({
  top,
  scale,
  duration,
  delay,
}: {
  top: number;
  scale: number;
  duration: number;
  delay: number;
}) {
  return (
    <div
      className="anim-drift absolute left-full"
      style={{
        top: `${top}%`,
        transform: `scale(${scale})`,
        animationDuration: `${duration}s`,
        animationDelay: `-${delay}s`,
      }}
      aria-hidden="true"
    >
      <div className="relative h-6 w-20">
        <div className="absolute bottom-0 left-0 h-4 w-20 rounded-full bg-[var(--cloud)] opacity-90" />
        <div className="absolute bottom-1 left-3 h-5 w-8 rounded-full bg-[var(--cloud)] opacity-90" />
        <div className="absolute bottom-1 left-10 h-6 w-7 rounded-full bg-[var(--cloud)] opacity-90" />
      </div>
    </div>
  );
});

/* ---------------------------------------------------------------------- *
 * Drill text
 * ---------------------------------------------------------------------- */

interface WordGroup {
  /** Cluster indices belonging to one unbreakable word (spaces excluded). */
  clusterIndices: number[];
  /** The trailing space cluster, if this word is followed by one. */
  spaceIndex: number | null;
}

/**
 * Group clusters into words so a line wraps between words rather than mid-word.
 * Khmer text without spaces simply becomes one long group and wraps per cluster,
 * which is exactly how Khmer line-breaking behaves.
 */
function groupWords(count: number, isSpace: (i: number) => boolean): WordGroup[] {
  const groups: WordGroup[] = [];
  let current: number[] = [];

  for (let i = 0; i < count; i += 1) {
    if (isSpace(i)) {
      groups.push({ clusterIndices: current, spaceIndex: i });
      current = [];
    } else {
      current.push(i);
    }
  }
  if (current.length > 0) groups.push({ clusterIndices: current, spaceIndex: null });
  return groups;
}

const LineText = memo(function LineText({
  engine,
  script,
}: {
  engine: TypingEngine;
  script: Mission["script"];
}) {
  const { clusters, states, cursor } = engine;

  const groups = useMemo(
    () => groupWords(clusters.length, (i) => clusters[i].isSpace),
    [clusters],
  );

  const renderCluster = (index: number) => {
    const cluster = clusters[index];
    const slice = states.slice(cluster.start, cluster.end);
    const isDone = slice.every((s) => s === "correct" || s === "corrected");
    const hasWrong = slice.some((s) => s === "wrong");
    const isActive = cursor >= cluster.start && cursor < cluster.end;

    const tone = hasWrong
      ? "bg-[var(--miss)] text-white"
      : isActive
        ? "bg-[var(--coin)] text-[#1b1b2f]"
        : isDone
          ? "text-[var(--hit)]"
          : "text-[var(--ink-soft)]";

    return (
      <span
        key={index}
        className={[
          "font-khmer relative rounded-[3px] px-[1.5px] py-0.5 transition-colors duration-75",
          tone,
          isActive ? "underline decoration-[3px] lg:decoration-[4px] underline-offset-4 lg:underline-offset-6" : "",
          cluster.isSpace ? "inline-block min-w-[0.55em]" : "",
        ].join(" ")}
      >
        {cluster.isSpace ? " " : cluster.text}
      </span>
    );
  };

  return (
    <p
      className={[
        "flex flex-wrap items-end gap-y-1 leading-relaxed select-none",
        script === "kh"
          ? "text-xl sm:text-2xl md:text-[1.65rem] lg:text-[1.85rem]"
          : "font-mono text-lg sm:text-xl md:text-[1.35rem] lg:text-2xl",
      ].join(" ")}
      // The visible text is decorative for AT; NextKeyChip announces what to type.
      aria-hidden="true"
    >
      {groups.map((group, gi) => (
        <span key={gi} className="inline-flex whitespace-nowrap">
          {group.clusterIndices.map(renderCluster)}
          {group.spaceIndex !== null ? renderCluster(group.spaceIndex) : null}
        </span>
      ))}
    </p>
  );
});

/* ---------------------------------------------------------------------- *
 * Arena
 * ---------------------------------------------------------------------- */

interface EatenCoinParticle {
  id: number;
  left: number;
  char: string;
}

/** Input types that represent a person actually typing. */
const TYPED_INPUT_TYPES = new Set(["insertText", "insertCompositionText"]);

/** Upper bound on code points a single keystroke can legitimately insert. */
const MAX_INSERT_CODE_POINTS = 8;

export function GameArena({
  engine,
  mission,
  layoutId,
  finger,
  onExit,
}: {
  engine: TypingEngine;
  mission: Mission;
  /** Concrete key table, already resolved from the mission's script. */
  layoutId: LayoutId;
  finger: Finger | null;
  onExit: () => void;
}) {
  const { t } = useApp();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  /* ---------------- hero / enemy positions ---------------- */
  // 4% .. 86% of the arena width, so the hero lands at the flag on completion.
  const heroLeft = 4 + engine.missionProgress * 82;
  const livesLost = engine.maxLives - engine.lives;
  // Goombas start well behind and close the gap with every life lost.
  const goombaLeft = Math.max(-6, heroLeft - 26 + livesLost * (24 / engine.maxLives));

  /* ---------------- hop / hurt animation ---------------- */
  // Re-keying the wrapper restarts the CSS animation on every event, which a
  // className toggle alone cannot do.
  const [beat, setBeat] = useState<{ n: number; kind: "hop" | "hurt" }>({ n: 0, kind: "hop" });
  useEffect(() => {
    if (engine.hitSeq > 0) setBeat({ n: engine.hitSeq * 2, kind: "hop" });
  }, [engine.hitSeq]);
  useEffect(() => {
    if (engine.missSeq > 0) setBeat({ n: engine.missSeq * 2 + 1, kind: "hurt" });
  }, [engine.missSeq]);

  /* ---------------- letter coins ahead of Mario ---------------- */
  const upcomingCoins = useMemo(() => {
    if (!engine.expected || engine.cursor >= engine.chars.length) return [];
    const items = [];
    const maxCoins = 14;
    const remaining = engine.chars.length - engine.cursor;
    const totalToGenerate = Math.min(maxCoins, remaining);

    for (let i = 0; i < totalToGenerate; i++) {
      const char = engine.chars[engine.cursor + i];
      const isCurrent = i === 0;
      // Target coin placed 5.2% ahead of Mario, subsequent coins spaced evenly across track
      const left = heroLeft + 5.2 + i * 4.8;
      // Stop before overlapping flagpole at ~86%
      if (left > 85.5 && !isCurrent) break;

      items.push({
        char,
        isSpace: char === " " || char === "\u200B",
        isCurrent,
        left: Math.min(left, 85.5),
        index: engine.cursor + i,
      });
    }
    return items;
  }, [engine.expected, engine.cursor, engine.chars, heroLeft]);

  /* ---------------- eaten coin particles ---------------- */
  const [eatenCoins, setEatenCoins] = useState<EatenCoinParticle[]>([]);
  const targetCharRef = useRef<{ char: string; left: number }>({
    char: engine.expected ?? "",
    left: Math.min(heroLeft + 5.5, 85),
  });

  useEffect(() => {
    if (engine.hitSeq === 0) return;
    const { char, left } = targetCharRef.current;
    const id = engine.hitSeq;
    setEatenCoins((prev) => [...prev.slice(-6), { id, left, char }]);
    const timer = window.setTimeout(
      () => setEatenCoins((prev) => prev.filter((c) => c.id !== id)),
      550,
    );
    return () => window.clearTimeout(timer);
  }, [engine.hitSeq]);

  useEffect(() => {
    targetCharRef.current = {
      char: engine.expected ?? "",
      left: Math.min(heroLeft + 5.5, 85),
    };
  }, [engine.expected, heroLeft]);

  /* ---------------- focus management ---------------- */
  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  useEffect(() => {
    focusInput();
  }, [focusInput, mission.id]);

  // Typing anywhere on the page should reach the game, not the void.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.activeElement !== inputRef.current) focusInput();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusInput]);

  /* ---------------- input handling ---------------- */
  // The engine object is rebuilt on every keystroke, so hold it in a ref: the
  // native listener below must be attached exactly once, not re-bound per frame.
  const engineRef = useRef(engine);
  engineRef.current = engine;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onNativeBeforeInput = (event: InputEvent) => {
      // Always cancel: the field is a capture surface, never a text buffer.
      event.preventDefault();
      // Rejects insertFromPaste / insertFromDrop / insertReplacementText.
      if (!TYPED_INPUT_TYPES.has(event.inputType)) return;
      const data = event.data;
      if (!data || toCodePoints(data).length > MAX_INSERT_CODE_POINTS) return;
      engineRef.current.handleInput(data);
    };

    el.addEventListener("beforeinput", onNativeBeforeInput);
    return () => el.removeEventListener("beforeinput", onNativeBeforeInput);
  }, []);

  const onInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      // Only reached if `beforeinput` was not cancellable in this engine; apply
      // the same length guard so a paste cannot slip through the back door.
      const el = event.currentTarget;
      const value = el.value;
      el.value = "";
      if (value && toCodePoints(value).length <= MAX_INSERT_CODE_POINTS) {
        engine.handleInput(value);
      }
    },
    [engine],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        engine.handleBackspace();
        return;
      }
      if (event.key === "Enter") {
        // Never insert a newline; drills are one line at a time.
        event.preventDefault();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onExit();
      }
      // Tab is deliberately left alone so keyboard navigation still works.
    },
    [engine, onExit],
  );

  const showFocusPrompt = !focused && (engine.status === "ready" || engine.status === "playing");

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      {/* ---------------- scene ---------------- */}
      <div
        className={[
          "retro-sky relative h-24 sm:h-26 md:h-28 lg:h-30 overflow-hidden rounded-md border-[3px] border-[var(--panel-edge)] shrink-0",
          engine.status === "lost" ? "anim-shake" : "",
        ].join(" ")}
        role="img"
        aria-label={t("game.arena")}
      >
        <Cloud top={6} scale={0.85} duration={38} delay={0} />
        <Cloud top={16} scale={0.6} duration={54} delay={18} />
        <Cloud top={4} scale={1} duration={70} delay={40} />
        <Cloud top={14} scale={0.7} duration={48} delay={28} />

        {/* Rolling hills, two depths for parallax feel. */}
        <div className="absolute bottom-6 sm:bottom-7 left-[6%] h-11 w-32 lg:h-14 lg:w-44 rounded-t-full bg-[var(--hill-far)] opacity-80" />
        <div className="absolute bottom-6 sm:bottom-7 left-[46%] h-15 w-44 lg:h-20 lg:w-56 rounded-t-full bg-[var(--hill-far)] opacity-70" />
        <div className="absolute bottom-6 sm:bottom-7 left-[75%] h-13 w-36 lg:h-16 lg:w-48 rounded-t-full bg-[var(--hill-far)] opacity-75 hidden md:block" />
        <div className="absolute bottom-6 sm:bottom-7 left-[24%] h-8 w-28 lg:h-11 lg:w-36 rounded-t-full bg-[var(--hill-near)]" />

        {/* Flagpole marks the end of the mission. */}
        <div className="absolute bottom-6 sm:bottom-7 right-3 sm:right-5 lg:right-8">
          <Flag raised={engine.status === "won"} />
        </div>

        {/* Ahead of Mario: Letter Coins waiting to be eaten */}
        {engine.status !== "won" &&
          upcomingCoins.map((coin) => {
            const isTarget = coin.isCurrent;
            const isMissed = isTarget && engine.missSeq > 0 && beat.kind === "hurt";
            return (
              <div
                key={`${coin.index}-${coin.char}`}
                className={[
                  "pointer-events-none absolute transition-[left] duration-200 ease-out flex flex-col items-center",
                  isTarget ? (isMissed ? "z-20 anim-shake" : "z-20 anim-bob") : "z-10 opacity-85",
                ].join(" ")}
                style={{
                  left: `${coin.left}%`,
                  bottom: isTarget ? "2.1rem" : "2.25rem",
                }}
              >
                {/* EAT Indicator over current target coin */}
                {isTarget ? (
                  <div className="flex items-center gap-0.5 mb-0.5 animate-bounce whitespace-nowrap">
                    <span className="font-retro text-[7.5px] sm:text-[8.5px] text-[var(--coin)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-tight">
                      {t("game.eat")}
                    </span>
                    <span className="text-[7px] sm:text-[8px] text-[var(--coin)] leading-none">▼</span>
                  </div>
                ) : null}

                {/* The Coin itself with letter inside */}
                <div
                  className={[
                    "relative flex items-center justify-center rounded-full border-2 transition-all duration-150 select-none shadow-md",
                    isTarget
                      ? isMissed
                        ? "h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-b from-[#fca5a5] via-[#ef4444] to-[#b91c1c] border-[#7f1d1d] ring-2 ring-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                        : "h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-b from-[#fff275] via-[#f59e0b] to-[#b45309] border-[#78350f] ring-2 ring-[#fef08a] shadow-[0_0_12px_rgba(250,204,21,0.75)]"
                      : "h-6 w-6 sm:h-6.5 sm:w-6.5 bg-gradient-to-b from-[#fde68a] to-[#d97706] border-[#92400e]",
                  ].join(" ")}
                >
                  {/* Inner coin ridge */}
                  <div className="absolute inset-[2px] rounded-full border border-[#fef9c3]/60 pointer-events-none" />

                  {/* The character to eat */}
                  <span
                    className={[
                      "leading-none font-bold select-none drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]",
                      isTarget ? "text-[#451a03]" : "text-[#78350f]",
                      coin.isSpace ? "text-[10px] sm:text-[11px]" : "text-xs sm:text-sm font-khmer",
                    ].join(" ")}
                  >
                    {coin.isSpace ? "␣" : displayGlyph(coin.char)}
                  </span>
                </div>
              </div>
            );
          })}

        {/* Eaten coin burst particles when Mario eats a letter */}
        {eatenCoins.map((eaten) => (
          <div
            key={eaten.id}
            className="pointer-events-none absolute z-30 flex flex-col items-center"
            style={{
              left: `${eaten.left}%`,
              bottom: "2.3rem",
            }}
          >
            {/* Floating score / eat pop */}
            <span className="anim-score-pop font-retro text-[9px] sm:text-[10px] font-bold text-[var(--coin)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
              +10 🪙
            </span>

            {/* Exploding coin particle */}
            <div className="anim-eat relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-[#78350f] bg-gradient-to-b from-[#fff275] via-[#f59e0b] to-[#b45309] ring-2 ring-white shadow-lg">
              <span className="text-[11px] sm:text-xs font-bold font-khmer text-[#451a03]">
                {eaten.char === " " ? "␣" : displayGlyph(eaten.char)}
              </span>
            </div>
          </div>
        ))}

        {/* Hero — `left` is driven straight from mission progress. */}
        <div
          className="absolute bottom-6 sm:bottom-7 transition-[left] duration-200 ease-out origin-bottom-left"
          style={{ left: `${heroLeft}%` }}
        >
          {/* Eating / Nom bubble when hopping */}
          {beat.kind === "hop" && engine.hitSeq > 0 ? (
            <div className="anim-pop absolute -top-5 -right-2 z-20 flex items-center gap-0.5 rounded-full border border-[var(--panel-edge)] bg-[var(--key-face)] px-1 py-0.5 shadow-sm">
              <span className="text-[8px] leading-none">😋</span>
              <span className="font-retro text-[7.5px] leading-none text-[var(--coin)]">+🪙</span>
            </div>
          ) : null}

          <div key={beat.n} className={beat.kind === "hop" ? "anim-hop" : "anim-hurt"}>
            <Hero />
          </div>
        </div>

        {/* Pursuer — closes in as lives are lost. */}
        {engine.lives < engine.maxLives ? (
          <div
            className="absolute bottom-6 sm:bottom-7 transition-[left] duration-500 ease-out origin-bottom-left"
            style={{ left: `${goombaLeft}%` }}
          >
            <Goomba />
          </div>
        ) : null}

        <div className="ground-bricks absolute inset-x-0 bottom-0 h-6 sm:h-7 border-t-[2px] border-[var(--brick-line)]" />
      </div>

      {/* ---------------- text + capture input ---------------- */}
      <div
        className={[
          "pixel-panel relative rounded-md p-2 sm:p-2.5 md:p-3 shrink-0",
          showFocusPrompt ? "cursor-text" : "",
        ].join(" ")}
        onMouseDown={focusInput}
      >
        <LineText engine={engine} script={mission.script} />

        <div className="mt-1.5 sm:mt-2 border-t border-dashed border-[var(--key-edge)] pt-1.5 sm:pt-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <NextKeyChip target={engine.expected} layoutId={layoutId} />
          <HandGuide finger={finger} />
        </div>

        {engine.status === "ready" ? (
          <p className="mt-1 text-[10px] sm:text-[11px] font-semibold text-[var(--ink-soft)]">
            {t("game.typeToStart")}
          </p>
        ) : null}

        <textarea
          ref={inputRef}
          className="sr-input focus-ring"
          aria-label={t("a11y.typingInput")}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          defaultValue=""
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={(event) => event.preventDefault()}
          onDrop={(event) => event.preventDefault()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {showFocusPrompt ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-[var(--panel)]/85">
            <span className="font-retro text-[10px] text-[var(--ink)] sm:text-[12px]">
              {t("game.focus")}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
