"use client";

import React from "react";
import { DifficultyLevel, LanguageMode } from "./types";

interface MouseGameHudProps {
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  combo: number;
  shockwaveEnergy: number; // 0 - 100
  bladeSize: number; // 24 - 76
  language: LanguageMode;
  difficulty: DifficultyLevel;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onOpenMenu: () => void;
}

export const MouseGameHud: React.FC<MouseGameHudProps> = ({
  score,
  highScore,
  lives,
  maxLives,
  combo,
  shockwaveEnergy,
  bladeSize,
  language,
  difficulty,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onOpenMenu,
}) => {
  const isKm = language === "km";

  // Compute blade type label
  let bladeLabel = "KATANA";
  if (bladeSize > 56) bladeLabel = isKm ? "ដាវធ្ងន់ (HEAVY CLEAVER)" : "HEAVY CLEAVER";
  else if (bladeSize > 38) bladeLabel = isKm ? "ដាវមធ្យម (STANDARD)" : "STANDARD BLADE";
  else bladeLabel = isKm ? "ដាវកាតាណា (KATANA)" : "KATANA";

  const isShockwaveReady = shockwaveEnergy >= 100;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 select-none font-khmer">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Menu back button & Mode badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-lg font-retro text-[10px] sm:text-xs font-bold active:scale-95 cursor-pointer"
            title={isKm ? "ម៉ឺនុយមេ" : "Main Menu"}
          >
            <svg
              className="w-3.5 h-3.5 text-sky-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{isKm ? "ចាកចេញ" : "Menu"}</span>
          </button>

          {/* Level Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md font-retro text-[10px] font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isKm
                ? `កម្រិត ${difficulty}`
                : `LVL ${difficulty}`}
            </span>
          </div>
        </div>

        {/* Center: Score, High Score & Shockwave status */}
        <div className="flex items-center gap-3 sm:gap-6 bg-slate-950/80 border border-slate-800/80 px-4 py-1.5 rounded-2xl backdrop-blur-xl shadow-2xl">
          {/* Score */}
          <div className="text-center">
            <div className="font-retro text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              {isKm ? "ពិន្ទុ" : "SCORE"}
            </div>
            <div className="font-retro text-lg sm:text-2xl font-black tracking-tight text-white">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          {/* High Score */}
          <div className="text-center">
            <div className="font-retro text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-400/90 font-bold flex items-center justify-center gap-1">
              <span>👑</span>
              <span>{isKm ? "កំណត់ត្រា" : "BEST"}</span>
            </div>
            <div className="font-retro text-base sm:text-xl font-black text-amber-300">
              {highScore.toLocaleString()}
            </div>
          </div>

          {/* Combo chip */}
          {combo > 1 && (
            <>
              <div className="w-px h-8 bg-slate-800" />
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/50 px-2.5 py-1 rounded-xl animate-bounce shadow-lg shadow-amber-500/10">
                <span className="text-xs">🔥</span>
                <span className="font-retro text-[10px] sm:text-xs font-black text-amber-300">
                  x{combo}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Lives, Sound & Pause buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Lives display */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md">
            {Array.from({ length: maxLives }).map((_, i) => (
              <span
                key={i}
                className={`text-base sm:text-lg transition-transform duration-300 ${
                  i < lives ? "scale-100 text-rose-500 animate-pulse" : "scale-75 opacity-30 grayscale"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
            title={isMuted ? (isKm ? "បើកសំឡេង" : "Unmute") : (isKm ? "បិទសំឡេង" : "Mute")}
          >
            {isMuted ? (
              <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Pause button */}
          <button
            onClick={onTogglePause}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
            title={isPaused ? (isKm ? "បន្តលេង" : "Resume") : (isKm ? "ផ្អាក" : "Pause")}
          >
            {isPaused ? (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Sub-HUD: Shockwave Energy Gauge & Blade Size Pill */}
      <div className="max-w-7xl mx-auto mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Shockwave Power Bar */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/90 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-1.5 font-bold font-retro text-[9px] sm:text-[10px]">
            <span className={isShockwaveReady ? "animate-spin text-sky-300" : "text-slate-400"}>⚡</span>
            <span className={isShockwaveReady ? "text-sky-300 font-extrabold" : "text-slate-400"}>
              {isKm ? "រលកធាតុ (SHOCKWAVE):" : "SHOCKWAVE:"}
            </span>
          </div>

          <div className="w-28 sm:w-40 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isShockwaveReady
                  ? "bg-gradient-to-r from-sky-400 to-cyan-300 shadow-md shadow-sky-400/50 animate-pulse"
                  : "bg-gradient-to-r from-sky-600 to-blue-500"
              }`}
              style={{ width: `${shockwaveEnergy}%` }}
            />
          </div>

          <span
            className={`font-retro font-bold text-[9px] sm:text-[10px] ${
              isShockwaveReady ? "text-sky-300 animate-bounce" : "text-slate-400"
            }`}
          >
            {isShockwaveReady
              ? (isKm ? "ចុចស្តាំរួចរាល់!" : "RIGHT CLICK READY!")
              : `${Math.round(shockwaveEnergy)}%`}
          </span>
        </div>

        {/* Blade Size Indicator */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/90 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg">
          <span className="text-slate-400 flex items-center gap-1 font-retro text-[9px] sm:text-[10px] font-bold">
            <span>⚔️</span>
            <span>{isKm ? "ទំហំផ្លែដាវ:" : "BLADE REACH:"}</span>
          </span>
          <span className="text-sky-400 font-retro font-extrabold text-[10px]">{bladeSize}px</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 font-retro text-[8px] sm:text-[9px] font-bold text-slate-300">
            {bladeLabel}
          </span>
          <span className="hidden md:inline text-[10px] text-slate-500">
            ({isKm ? "បង្វិលកង់ Mouse ដើម្បីប្តូរ" : "Scroll wheel to adjust"})
          </span>
        </div>
      </div>
    </header>
  );
};
