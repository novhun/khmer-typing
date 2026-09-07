"use client";

/**
 * The typing state machine.
 *
 * KEY DESIGN DECISION — the unit of comparison is a **code point**, never a
 * grapheme cluster and never a UTF-16 unit:
 *
 *   • UTF-16 units would break on any astral character.
 *   • Grapheme clusters would be wrong for Khmer, where one orthographic
 *     syllable such as "ស្រុ" is FOUR separate keystrokes (ស + ្ + រ + ុ).
 *
 * Clusters are still computed, but only for rendering (see `khmer.ts`). This
 * split is what lets the same engine drive Khmer coeng drills and English
 * pangrams without a single conditional on script.
 *
 * Mistakes do NOT advance the cursor: the learner must type the right key, which
 * is how every serious typing tutor behaves. A fixed mistake is recorded as
 * `corrected` so the UI can show it without counting it as an outstanding error.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { segmentClusters, toCodePoints, type Cluster } from "@/lib/khmer";
import type { Mission } from "@/lib/missions";
import { sfx } from "@/lib/sfx";

export type CharState = "pending" | "correct" | "corrected" | "wrong";
export type GameStatus = "ready" | "playing" | "won" | "lost";

export const DEFAULT_LIVES = 5;
/** Combo needed per extra point multiplier, capped at MAX_MULTIPLIER. */
const COMBO_STEP = 10;
const MAX_MULTIPLIER = 5;
const POINTS_PER_HIT = 10;
const POINTS_PER_FIX = 5;
const PENALTY_PER_MISS = 5;

interface State {
  missionId: string;
  lines: string[];
  lineIndex: number;
  /** Code points of the current line. */
  chars: string[];
  /** Index of the next code point to type, within the current line. */
  cursor: number;
  states: CharState[];

  lives: number;
  maxLives: number;
  score: number;
  coins: number;
  combo: number;
  maxCombo: number;

  /** Keystrokes that landed on the wrong character. */
  errors: number;
  /** Every character-producing keystroke (backspace excluded). */
  keystrokes: number;
  /** Keystrokes that matched the expected character. */
  correct: number;
  /** Characters banked by fully completed lines (for mission progress). */
  clearedChars: number;

  startedAt: number | null;
  finishedAt: number | null;
  status: GameStatus;

  /** Monotonic counters; effects watch these to fire sounds and animations. */
  hitSeq: number;
  missSeq: number;
  lineSeq: number;
}

type Action =
  | { type: "reset"; mission: Mission; maxLives: number }
  | { type: "input"; char: string; now: number }
  | { type: "backspace" };

function initState(mission: Mission, maxLives: number): State {
  const chars = toCodePoints(mission.lines[0] ?? "");
  return {
    missionId: mission.id,
    lines: mission.lines,
    lineIndex: 0,
    chars,
    cursor: 0,
    states: chars.map(() => "pending"),
    lives: maxLives,
    maxLives,
    score: 0,
    coins: 0,
    combo: 0,
    maxCombo: 0,
    errors: 0,
    keystrokes: 0,
    correct: 0,
    clearedChars: 0,
    startedAt: null,
    finishedAt: null,
    status: "ready",
    hitSeq: 0,
    missSeq: 0,
    lineSeq: 0,
  };
}

const multiplierFor = (combo: number): number =>
  Math.min(MAX_MULTIPLIER, 1 + Math.floor(combo / COMBO_STEP));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return initState(action.mission, action.maxLives);

    case "backspace": {
      if (state.status !== "playing" || state.cursor === 0) return state;
      const cursor = state.cursor - 1;
      const previous = state.states[cursor];
      const states = state.states.slice();
      states[cursor] = "pending";
      // Un-award the character so back-and-forth typing can't farm coins.
      const wasScored = previous === "correct" || previous === "corrected";
      return {
        ...state,
        cursor,
        states,
        combo: 0,
        coins: wasScored ? Math.max(0, state.coins - 1) : state.coins,
        score: wasScored ? Math.max(0, state.score - POINTS_PER_HIT) : state.score,
      };
    }

    case "input": {
      if (state.status === "won" || state.status === "lost") return state;

      const expected = state.chars[state.cursor];
      if (expected === undefined) return state;

      const startedAt = state.startedAt ?? action.now;

      /* ---------------- wrong key ---------------- */
      if (action.char !== expected) {
        const states = state.states.slice();
        states[state.cursor] = "wrong";
        const lives = state.lives - 1;
        const dead = lives <= 0;
        return {
          ...state,
          states,
          startedAt,
          status: dead ? "lost" : "playing",
          finishedAt: dead ? action.now : state.finishedAt,
          lives: Math.max(0, lives),
          combo: 0,
          errors: state.errors + 1,
          keystrokes: state.keystrokes + 1,
          score: Math.max(0, state.score - PENALTY_PER_MISS),
          missSeq: state.missSeq + 1,
        };
      }

      /* ---------------- correct key ---------------- */
      const states = state.states.slice();
      const wasWrong = states[state.cursor] === "wrong";
      states[state.cursor] = wasWrong ? "corrected" : "correct";

      // Fixing your own mistake earns fewer points and does not rebuild a combo.
      const combo = wasWrong ? 0 : state.combo + 1;
      const gain = wasWrong ? POINTS_PER_FIX : POINTS_PER_HIT * multiplierFor(combo);

      const next: State = {
        ...state,
        states,
        startedAt,
        status: "playing",
        cursor: state.cursor + 1,
        combo,
        maxCombo: Math.max(state.maxCombo, combo),
        coins: state.coins + 1,
        score: state.score + gain,
        correct: state.correct + 1,
        keystrokes: state.keystrokes + 1,
        hitSeq: state.hitSeq + 1,
      };

      /* ---------------- line finished? ---------------- */
      if (next.cursor < next.chars.length) return next;

      const isLastLine = next.lineIndex >= next.lines.length - 1;
      if (isLastLine) {
        return { ...next, status: "won", finishedAt: action.now, lineSeq: next.lineSeq + 1 };
      }

      const lineIndex = next.lineIndex + 1;
      const chars = toCodePoints(next.lines[lineIndex]);
      return {
        ...next,
        lineIndex,
        chars,
        cursor: 0,
        states: chars.map(() => "pending"),
        clearedChars: next.clearedChars + next.chars.length,
        lineSeq: next.lineSeq + 1,
      };
    }

    default:
      return state;
  }
}

/* ---------------------------------------------------------------------- *
 * Public snapshot
 * ---------------------------------------------------------------------- */

export interface TypingEngine {
  status: GameStatus;
  /** Current line as code points, plus per-code-point verdicts. */
  chars: string[];
  states: CharState[];
  cursor: number;
  /** The exact code point the learner must produce next (null when finished). */
  expected: string | null;
  /** Display clusters of the current line (never split a Khmer stack). */
  clusters: Cluster[];
  /** Index into `clusters` containing the cursor, or -1. */
  activeCluster: number;

  lineIndex: number;
  lineCount: number;
  lives: number;
  maxLives: number;
  score: number;
  coins: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  errors: number;
  keystrokes: number;

  elapsedMs: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  /** 0–1 within the current line. */
  lineProgress: number;
  /** 0–1 across the whole mission — drives the hero's walk to the flag. */
  missionProgress: number;

  /** Animation triggers: change identity on every hit / miss / line clear. */
  hitSeq: number;
  missSeq: number;
  lineSeq: number;

  /** Feed inserted text (may be several code points for one keypress). */
  handleInput: (text: string) => void;
  handleBackspace: () => void;
  reset: () => void;
}

export function useTypingEngine(mission: Mission, maxLives = DEFAULT_LIVES): TypingEngine {
  const [state, dispatch] = useReducer(reducer, undefined, () => initState(mission, maxLives));

  // Swapping missions restarts the machine. The ref guard means a parent that
  // re-creates the mission object (or re-renders for any other reason) cannot
  // wipe a run in progress — only a genuine identity change resets.
  const runKey = `${mission.id}:${maxLives}`;
  const lastRunKey = useRef(runKey);
  useEffect(() => {
    if (lastRunKey.current === runKey) return;
    lastRunKey.current = runKey;
    dispatch({ type: "reset", mission, maxLives });
  }, [runKey, mission, maxLives]);

  /* ---------------- clock ---------------- */
  // A 200ms tick is plenty for a WPM read-out and keeps re-renders cheap; the
  // interval only exists while the game is actually running.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => setTick(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [state.status]);

  const elapsedMs = useMemo(() => {
    if (state.startedAt === null) return 0;
    const end = state.finishedAt ?? Math.max(tick, state.startedAt);
    return Math.max(0, end - state.startedAt);
  }, [state.startedAt, state.finishedAt, tick]);

  /* ---------------- sound ---------------- */
  useEffect(() => {
    if (state.hitSeq > 0) sfx.play("coin");
  }, [state.hitSeq]);

  useEffect(() => {
    if (state.missSeq > 0) sfx.play("bump");
  }, [state.missSeq]);

  useEffect(() => {
    if (state.status === "won") sfx.play("win");
    else if (state.status === "lost") sfx.play("lose");
  }, [state.status]);

  /* ---------------- derived text ---------------- */
  const line = state.lines[state.lineIndex] ?? "";
  const clusters = useMemo(() => segmentClusters(line), [line]);

  const activeCluster = useMemo(
    () => clusters.findIndex((c) => state.cursor >= c.start && state.cursor < c.end),
    [clusters, state.cursor],
  );

  const totalChars = useMemo(
    () => state.lines.reduce((sum, l) => sum + toCodePoints(l).length, 0),
    [state.lines],
  );

  /* ---------------- handlers ---------------- */
  const handleInput = useCallback((text: string) => {
    const now = Date.now();
    // One keypress can insert several code points (e.g. Shift+A on the Khmer
    // layout yields "ាំ"); replay them through the machine in order.
    for (const char of toCodePoints(text)) {
      dispatch({ type: "input", char, now });
    }
  }, []);

  const handleBackspace = useCallback(() => dispatch({ type: "backspace" }), []);

  const reset = useCallback(() => {
    dispatch({ type: "reset", mission, maxLives });
  }, [mission, maxLives]);

  /* ---------------- snapshot ---------------- */
  return useMemo<TypingEngine>(() => {
    const minutes = elapsedMs / 60000;
    // Standard convention: one "word" is 5 characters. CPM is the more honest
    // figure for Khmer, so both are surfaced in the HUD.
    const wpm = minutes > 0 ? Math.round(state.correct / 5 / minutes) : 0;
    const cpm = minutes > 0 ? Math.round(state.correct / minutes) : 0;
    const accuracy =
      state.keystrokes > 0 ? Math.round((state.correct / state.keystrokes) * 100) : 100;

    return {
      status: state.status,
      chars: state.chars,
      states: state.states,
      cursor: state.cursor,
      expected: state.chars[state.cursor] ?? null,
      clusters,
      activeCluster,

      lineIndex: state.lineIndex,
      lineCount: state.lines.length,
      lives: state.lives,
      maxLives: state.maxLives,
      score: state.score,
      coins: state.coins,
      combo: state.combo,
      maxCombo: state.maxCombo,
      multiplier: multiplierFor(state.combo),
      errors: state.errors,
      keystrokes: state.keystrokes,

      elapsedMs,
      wpm,
      cpm,
      accuracy,
      lineProgress: state.chars.length > 0 ? state.cursor / state.chars.length : 0,
      missionProgress:
        totalChars > 0 ? Math.min(1, (state.clearedChars + state.cursor) / totalChars) : 0,

      hitSeq: state.hitSeq,
      missSeq: state.missSeq,
      lineSeq: state.lineSeq,

      handleInput,
      handleBackspace,
      reset,
    };
  }, [state, clusters, activeCluster, elapsedMs, totalChars, handleInput, handleBackspace, reset]);
}
