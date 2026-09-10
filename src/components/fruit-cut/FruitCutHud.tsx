"use client";

import React from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Flame,
  Zap,
  Sparkles,
  Heart,
  Home,
  SlidersHorizontal,
} from "lucide-react";
import { DifficultyLevel, GameStats, LanguageMode } from "./types";

interface FruitCutHudProps {
  stats: GameStats;
  language: LanguageMode;
  difficulty: DifficultyLevel;
  isPaused: boolean;
  isMuted: boolean;
  currentInput: string;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onOpenMenu?: () => void;
}

export const FruitCutHud: React.FC<FruitCutHudProps> = ({
  stats,
  language,
  difficulty,
  isPaused,
  isMuted,
  currentInput,
  onTogglePause,
  onToggleMute,
  onRestart,
  onOpenMenu,
}) => {
  // Difficulty label
  const diffLabels: Record<DifficultyLevel, { en: string; km: string }> = {
    1: { en: "Level 1: Basic", km: "កម្រិត ១៖ ដំបូង" },
    2: { en: "Level 2: Intermediate", km: "កម្រិត ២៖ មធ្យម" },
    3: { en: "Level 3: Advanced", km: "កម្រិត ៣៖ ជាន់ខ្ពស់" },
  };

  const currentDiff = diffLabels[difficulty];

  // Combo multiplier calculation
  const multiplier = Math.min(stats.combo, 10);
  const showCombo = stats.combo >= 2;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 sm:p-5 font-khmer">
      {/* Main top bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Back to Hub + Lives Health Bar */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Return Home Button */}
          <Link
            href="/"
            className="group flex h-10 items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-3 text-slate-300 backdrop-blur-md transition-all hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-white shadow-lg shadow-black/40 active:scale-95 cursor-pointer font-retro text-[10px] sm:text-xs"
            title={language === "km" ? "ត្រឡប់ទៅទំព័រដើម" : "Return to Home"}
            aria-label="Home"
          >
            <Home className="h-4 w-4 text-emerald-400 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline font-bold text-slate-200">
              {language === "km" ? "ទំព័រដើម" : "Home"}
            </span>
          </Link>

          {/* Lives health pill */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-3.5 py-2 backdrop-blur-md shadow-lg shadow-black/40">
            <span className="font-retro text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              {language === "km" ? "ជីវិត" : "Lives"}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: stats.maxLives }).map((_, index) => {
                const active = index < stats.lives;
                return (
                  <div
                    key={index}
                    className={`transition-all duration-300 transform ${
                      active
                        ? "scale-100"
                        : "scale-75 opacity-30"
                    }`}
                    title={active ? "Active Life" : "Lost Life"}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        active
                          ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse"
                          : "fill-slate-600 text-slate-600"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Score & Combo Badge */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2">
            <span className="font-retro text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
              {language === "km" ? "ពិន្ទុ" : "Score"}
            </span>
            <span className="font-retro text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Dynamic Combo Multiplier Pill */}
          {showCombo && (
            <div
              className={`mt-1 flex items-center gap-1.5 rounded-full px-3 py-0.5 font-retro text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-lg animate-bounce transition-all ${
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
              <span>
                {language === "km" ? `គុណនឹង x${multiplier}` : `Combo x${multiplier}!`}
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Mode Indicator & Unified Arcade Controls Pod */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Language & Difficulty Pill */}
          <div className="hidden lg:flex flex-col items-end rounded-2xl border border-white/15 bg-slate-900/80 px-3.5 py-1.5 backdrop-blur-md shadow-lg shadow-black/40">
            <div className="flex items-center gap-1.5 font-retro text-[10px] sm:text-[11px] font-bold text-emerald-400">
              <span>{language === "km" ? "🇰🇭 ភាសាខ្មែរ" : "🇺🇸 English"}</span>
            </div>
            <span className="font-retro text-[9px] sm:text-[10px] text-slate-300">
              {language === "km" ? currentDiff.km : currentDiff.en}
            </span>
          </div>

          {/* Arcade Action Buttons Pod */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-slate-900/85 p-1 backdrop-blur-md shadow-lg shadow-black/40">
            {/* Mode Menu button */}
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/15 hover:text-emerald-300 active:scale-95 cursor-pointer"
                title={language === "km" ? "ប្តូរភាសា / កម្រិត (Modes)" : "Mode Settings"}
                aria-label="Modes"
              >
                <SlidersHorizontal className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-400" />
              </button>
            )}

            {/* Audio toggle button */}
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
                <VolumeX className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-sky-400" />
              )}
            </button>

            {/* Pause / Resume button */}
            <button
              type="button"
              onClick={onTogglePause}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-300 active:scale-95 cursor-pointer"
              title={isPaused ? "Resume Game (Esc)" : "Pause Game (Esc)"}
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <Play className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-amber-400 text-amber-400" />
              ) : (
                <Pause className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-300" />
              )}
            </button>

            {/* Restart button */}
            <button
              type="button"
              onClick={onRestart}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:border-orange-400/40 hover:bg-orange-500/15 hover:text-orange-300 active:scale-95 cursor-pointer"
              title={language === "km" ? "លេងឡើងវិញ (Restart)" : "Restart Round"}
              aria-label="Restart"
            >
              <RotateCcw className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-orange-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Active Keying Feedback (shows what is currently typed) */}
      {currentInput.length > 0 && (
        <div className="pointer-events-none mx-auto flex items-center gap-2 rounded-full border border-emerald-400/50 bg-slate-950/85 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-emerald-500/20">
          <span className="font-retro text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">
            {language === "km" ? "កំពុងវាយ:" : "Typing:"}
          </span>
          <span className="font-khmer text-lg sm:text-xl font-black text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">
            {currentInput}
          </span>
        </div>
      )}
    </header>
  );
};
