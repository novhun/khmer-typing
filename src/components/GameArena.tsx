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
import { toCodePoints } from "@/lib/khmer";
import type { LayoutId } from "@/lib/keyboard";
import type { Mission } from "@/lib/missions";
import { NextKeyChip } from "./NextKeyChip";

/* ---------------------------------------------------------------------- *
 * Sprites
 * ---------------------------------------------------------------------- */

/** Plumber-ish hero: cap, moustache, overalls, boots. ~10 divs. */
const Hero = memo(function Hero() {
  return (
    <div className="relative h-12 w-9" aria-hidden="true">
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
    <div className="relative h-7 w-7 anim-bob" aria-hidden="true">
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
    <div className="relative h-24 w-8" aria-hidden="true">
      <div className="absolute bottom-0 left-3 h-24 w-1 bg-[#c0c0c8]" />
      <div className="absolute left-3 top-0 h-1.5 w-1.5 rounded-full bg-[var(--coin)]" />
      <div
        className={[
          "absolute left-4 h-4 w-5 anim-flag",
          raised ? "top-1 bg-[var(--coin)]" : "top-6 bg-[#e23b2e]",
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

interface CoinParticle {
  id: number;
  left: number;
}

/** Input types that represent a person actually typing. */
const TYPED_INPUT_TYPES = new Set(["insertText", "insertCompositionText"]);

/** Upper bound on code points a single keystroke can legitimately insert. */
const MAX_INSERT_CODE_POINTS = 8;

export function GameArena({
  engine,
  mission,
  layoutId,
  onExit,
}: {
  engine: TypingEngine;
  mission: Mission;
  /** Concrete key table, already resolved from the mission's script. */
  layoutId: LayoutId;
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

  /* ---------------- coin particles ---------------- */
  const [coins, setCoins] = useState<CoinParticle[]>([]);
  const heroLeftRef = useRef(heroLeft);
  heroLeftRef.current = heroLeft;

  useEffect(() => {
    if (engine.hitSeq === 0) return;
    const id = engine.hitSeq;
    setCoins((prev) => [...prev.slice(-7), { id, left: heroLeftRef.current }]);
    const timer = window.setTimeout(
      () => setCoins((prev) => prev.filter((c) => c.id !== id)),
      620,
    );
    return () => window.clearTimeout(timer);
  }, [engine.hitSeq]);

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
    <div className="flex flex-col gap-3">
      {/* ---------------- scene ---------------- */}
      <div
        className={[
          "retro-sky relative h-28 sm:h-34 md:h-38 lg:h-42 overflow-hidden rounded-md border-[3px] border-[var(--panel-edge)] shrink-0",
          engine.status === "lost" ? "anim-shake" : "",
        ].join(" ")}
        role="img"
        aria-label={t("game.arena")}
      >
        <Cloud top={6} scale={0.9} duration={38} delay={0} />
        <Cloud top={18} scale={0.65} duration={54} delay={18} />
        <Cloud top={4} scale={1.1} duration={70} delay={40} />
        <Cloud top={14} scale={0.75} duration={48} delay={28} />

        {/* Rolling hills, two depths for parallax feel. */}
        <div className="absolute bottom-7 sm:bottom-8 left-[6%] h-14 w-40 lg:h-20 lg:w-56 rounded-t-full bg-[var(--hill-far)] opacity-80" />
        <div className="absolute bottom-7 sm:bottom-8 left-[46%] h-20 w-56 lg:h-28 lg:w-80 rounded-t-full bg-[var(--hill-far)] opacity-70" />
        <div className="absolute bottom-7 sm:bottom-8 left-[75%] h-16 w-48 lg:h-24 lg:w-72 rounded-t-full bg-[var(--hill-far)] opacity-75 hidden md:block" />
        <div className="absolute bottom-7 sm:bottom-8 left-[24%] h-10 w-36 lg:h-14 lg:w-48 rounded-t-full bg-[var(--hill-near)]" />

        {/* Flagpole marks the end of the mission. */}
        <div className="absolute bottom-7 sm:bottom-8 right-3 sm:right-5 lg:right-8">
          <Flag raised={engine.status === "won"} />
        </div>

        {/* Coins spat out by correct keystrokes. */}
        {coins.map((coin) => (
          <span
            key={coin.id}
            className="anim-coin pointer-events-none absolute bottom-16 lg:bottom-20 text-base lg:text-xl"
            style={{ left: `${coin.left}%` }}
            aria-hidden="true"
          >
            🪙
          </span>
        ))}

        {/* Hero — `left` is driven straight from mission progress. */}
        <div
          className="absolute bottom-7 sm:bottom-8 transition-[left] duration-200 ease-out origin-bottom-left"
          style={{ left: `${heroLeft}%` }}
        >
          <div key={beat.n} className={beat.kind === "hop" ? "anim-hop" : "anim-hurt"}>
            <Hero />
          </div>
        </div>

        {/* Pursuer — closes in as lives are lost. */}
        {engine.lives < engine.maxLives ? (
          <div
            className="absolute bottom-7 sm:bottom-8 transition-[left] duration-500 ease-out origin-bottom-left"
            style={{ left: `${goombaLeft}%` }}
          >
            <Goomba />
          </div>
        ) : null}

        <div className="ground-bricks absolute inset-x-0 bottom-0 h-7 sm:h-8 border-t-[2px] border-[var(--brick-line)]" />
      </div>

      {/* ---------------- text + capture input ---------------- */}
      <div
        className={[
          "pixel-panel relative rounded-md p-2.5 sm:p-3 md:p-3.5 shrink-0",
          showFocusPrompt ? "cursor-text" : "",
        ].join(" ")}
        onMouseDown={focusInput}
      >
        <LineText engine={engine} script={mission.script} />

        <div className="mt-2 sm:mt-2.5 border-t border-dashed border-[var(--key-edge)] pt-1.5 sm:pt-2">
          <NextKeyChip target={engine.expected} layoutId={layoutId} />
        </div>

        {engine.status === "ready" ? (
          <p className="mt-2 text-[11px] font-semibold text-[var(--ink-soft)]">
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
