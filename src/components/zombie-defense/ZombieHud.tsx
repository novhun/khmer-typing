"use client";

import React from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Home,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Zap,
  Sparkles,
  Crosshair,
} from "lucide-react";
import { DifficultyLevel, GameStats, LanguageMode, ZombieItem } from "./types";

interface ZombieHudProps {
  stats: GameStats;
  language: LanguageMode;
  difficulty: DifficultyLevel;
  isPaused: boolean;
  isMuted: boolean;
  currentInput: string;
  targetedZombie?: ZombieItem;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onOpenMenu: () => void;
}

export const ZombieHud: React.FC<ZombieHudProps> = ({
  stats,
  language,
  difficulty,
  isPaused,
  isMuted,
  currentInput,
  targetedZombie,
  onTogglePause,
  onToggleMute,
  onRestart,
  onOpenMenu,
}) => {
  const isKm = language === "km";

  const diffLabels: Record<DifficultyLevel, { en: string; km: string }> = {
    1: { en: "Level 1: Recon", km: "កម្រិត ១៖ ល្បាត" },
    2: { en: "Level 2: Invasion", km: "កម្រិត ២៖ វាយលុក" },
    3: { en: "Level 3: Apocalypse", km: "កម្រិត ៣៖ មហន្តរាយ" },
  };

  const currentDiff = diffLabels[difficulty];
  const multiplier = Math.min(stats.combo, 10);
  const showCombo = stats.combo >= 2;

  // Base Health Color
  const healthPercent = Math.max(stats.baseHealth, 0);
  const healthColor =
    healthPercent > 50
      ? "bg-emerald-500 shadow-emerald-500/50"
      : healthPercent > 25
      ? "bg-amber-500 shadow-amber-500/50"
      : "bg-red-500 shadow-red-500/50 animate-pulse";

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 sm:p-5 font-khmer">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Home link + Base Integrity Health */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Return Home */}
          <Link
            href="/"
            className="group flex h-10 items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/85 px-3 text-slate-300 backdrop-blur-md transition-all hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-white shadow-lg shadow-black/40 active:scale-95 cursor-pointer"
            title={isKm ? "ត្រឡប់ទៅទំព័រដើម" : "Return to Home Hub"}
          >
            <Home className="h-4 w-4 text-emerald-400 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline text-xs font-bold text-slate-200">
              {isKm ? "ទំព័រដើម" : "Home"}
            </span>
          </Link>

          {/* Base Integrity Bar */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/85 px-3.5 py-2 backdrop-blur-md shadow-lg shadow-black/40">
            {healthPercent > 25 ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 animate-bounce" />
            )}

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 font-retro text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{isKm ? "បន្ទាយការពារ" : "Base Health"}</span>
                <span
                  className={
                    healthPercent > 25 ? "text-slate-200 font-bold" : "text-red-400 font-black"
                  }
                >
                  {healthPercent}%
                </span>
              </div>
              <div className="mt-1 h-2 w-24 sm:w-32 overflow-hidden rounded-full bg-slate-800 border border-white/10">
                <div
                  className={`h-full transition-all duration-300 ${healthColor}`}
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Wave, Score & Combo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-red-500/40 bg-red-500/15 px-2 py-0.5 font-retro text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-red-400">
              {isKm ? `រលកទី ${stats.wave}` : `WAVE ${stats.wave}`}
            </span>
            <span className="font-retro text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Combo Multiplier Pill */}
          {showCombo && (
            <div
              className={`mt-1 flex items-center gap-1.5 rounded-full px-3 py-0.5 font-retro text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-lg animate-bounce transition-all ${
                multiplier >= 5
                  ? "border border-amber-400 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/50"
                  : multiplier >= 3
                  ? "border border-orange-400 bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-500/40"
                  : "border border-yellow-400/50 bg-yellow-500/30 text-yellow-300"
              }`}
            >
              {multiplier >= 5 ? (
                <Sparkles className="h-4 w-4 fill-current animate-spin" />
              ) : multiplier >= 3 ? (
                <Zap className="h-4 w-4 fill-current" />
              ) : (
                <Flame className="h-4 w-4 fill-current" />
              )}
              <span>{isKm ? `គុណនឹង x${multiplier}` : `Combo x${multiplier}!`}</span>
            </div>
          )}
        </div>

        {/* Right Section: Mode Pill & Control Pod */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Mode Pill */}
          <div className="hidden lg:flex flex-col items-end rounded-2xl border border-white/15 bg-slate-900/85 px-3.5 py-1.5 backdrop-blur-md shadow-lg shadow-black/40">
            <div className="flex items-center gap-1 font-retro text-[10px] sm:text-[11px] font-bold text-emerald-400">
              <span>{isKm ? "🇰🇭 ភាសាខ្មែរ" : "🇺🇸 English"}</span>
            </div>
            <span className="font-retro text-[9px] sm:text-[10px] text-slate-300">
              {isKm ? currentDiff.km : currentDiff.en}
            </span>
          </div>

          {/* Arcade Action Buttons Pod */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-slate-900/85 p-1 backdrop-blur-md shadow-lg shadow-black/40">
            {/* Mode Switcher */}
            <button
              type="button"
              onClick={onOpenMenu}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/15 hover:text-emerald-300 active:scale-95 cursor-pointer"
              title={isKm ? "ប្តូរកម្រិត / ភាសា" : "Mode Menu"}
              aria-label="Modes"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            </button>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent transition-all active:scale-95 cursor-pointer ${
                isMuted
                  ? "text-rose-400 hover:border-rose-400/40 hover:bg-rose-500/15"
                  : "text-sky-400 hover:border-sky-400/40 hover:bg-sky-500/15"
              }`}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-sky-400" />
              )}
            </button>

            {/* Pause Toggle */}
            <button
              type="button"
              onClick={onTogglePause}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-300 active:scale-95 cursor-pointer"
              title={isPaused ? "Resume (Esc)" : "Pause (Esc)"}
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <Play className="h-4 w-4 fill-amber-400 text-amber-400" />
              ) : (
                <Pause className="h-4 w-4 text-amber-300" />
              )}
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={onRestart}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:border-orange-400/40 hover:bg-orange-500/15 hover:text-orange-300 active:scale-95 cursor-pointer"
              title={isKm ? "លេងឡើងវិញ" : "Restart Round"}
              aria-label="Restart"
            >
              <RotateCcw className="h-4 w-4 text-orange-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Active Target Lock-on Bar */}
      {targetedZombie && (
        <div className="pointer-events-none mx-auto mt-1 flex items-center gap-3 rounded-full border border-emerald-400/50 bg-slate-950/90 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-emerald-500/20 font-retro">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Crosshair className="h-4 w-4 animate-spin text-emerald-400" />
            <span>{isKm ? "ចាក់សោគោលដៅ:" : "TARGET LOCKED:"}</span>
          </div>

          <div className="font-khmer text-lg sm:text-xl font-bold text-white flex items-center">
            <span className="text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">
              {targetedZombie.typedProgress}
            </span>
            <span className="text-slate-400">
              {targetedZombie.word.slice(targetedZombie.typedProgress.length)}
            </span>
          </div>

          {currentInput.length > 0 && (
            <span className="text-xs text-slate-400 border-l border-white/20 pl-2 font-mono">
              {currentInput}
            </span>
          )}
        </div>
      )}
    </header>
  );
};
