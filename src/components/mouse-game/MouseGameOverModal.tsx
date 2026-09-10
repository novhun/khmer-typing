"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RotateCcw,
  Home,
  Sliders,
  Trophy,
  Flame,
  Zap,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { GameStats, LanguageMode } from "./types";

interface MouseGameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  highScore: number;
  isNewHighScore: boolean;
  language: LanguageMode;
  onRestart: () => void;
  onChangeMode: () => void;
}

export const MouseGameOverModal: React.FC<MouseGameOverModalProps> = ({
  isOpen,
  stats,
  highScore,
  isNewHighScore,
  language,
  onRestart,
  onChangeMode,
}) => {
  if (!isOpen) return null;

  const isKm = language === "km";

  // Compute Rank based on score & slices
  let rank = "C";
  let rankTitle = isKm ? "និនចាដំបូង (Novice)" : "Novice Slicer";
  let rankColor = "from-slate-400 to-slate-200";

  if (stats.score >= 5000) {
    rank = "S+";
    rankTitle = isKm ? "កំពូលមហាដាវទេព (Godlike Blade)" : "Godlike Grandmaster";
    rankColor = "from-amber-400 via-rose-400 to-purple-400";
  } else if (stats.score >= 3000) {
    rank = "S";
    rankTitle = isKm ? "កំពូលមហានិនចា (Grandmaster)" : "Grandmaster Slicer";
    rankColor = "from-amber-300 to-yellow-500";
  } else if (stats.score >= 1800) {
    rank = "A";
    rankTitle = isKm ? "អ្នកចម្បាំងដាវឯក (Swordmaster)" : "Swordmaster";
    rankColor = "from-sky-400 to-cyan-300";
  } else if (stats.score >= 900) {
    rank = "B";
    rankTitle = isKm ? "និនចាជំនាញ (Skilled Ninja)" : "Skilled Blade";
    rankColor = "from-emerald-400 to-teal-300";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl font-khmer">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-500/10 text-center font-khmer"
      >
        {/* Defeat Icon / Crown */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/10">
          {isNewHighScore ? (
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          ) : (
            <span className="text-3xl">⚔️</span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black font-retro text-white tracking-tight">
          {isKm ? "ចប់ការប្រកួត !" : "Game Over"}
        </h2>

        {/* New High Score Banner */}
        {isNewHighScore && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 font-retro text-[9px] font-black animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isKm ? "កំណត់ត្រាថ្មីអស្ចារ្យ !" : "NEW HIGH SCORE!"}</span>
          </div>
        )}

        {/* Score & Rank Display */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-around">
          <div>
            <div className="font-retro text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              {isKm ? "ពិន្ទុសរុប" : "FINAL SCORE"}
            </div>
            <div className="font-retro text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.score.toLocaleString()}
            </div>
            <div className="font-retro text-[10px] text-amber-400 font-semibold mt-1">
              {isKm ? "កំណត់ត្រា ៖ " : "Best: "}
              {highScore.toLocaleString()}
            </div>
          </div>

          <div className="w-px h-16 bg-slate-800" />

          <div>
            <div className="font-retro text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              {isKm ? "ចំណាត់ថ្នាក់" : "RANK"}
            </div>
            <div
              className={`text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${rankColor} font-retro mt-0.5`}
            >
              {rank}
            </div>
            <div className="font-retro text-[9px] text-slate-300 font-medium truncate max-w-[130px] mt-0.5">
              {rankTitle}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1 font-retro text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">
              <span className="text-emerald-400">🍉</span>
              <span>{isKm ? "កាត់ផ្លែឈើ" : "Sliced"}</span>
            </div>
            <div className="font-retro text-base font-bold text-white mt-1">
              {stats.fruitsSliced}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1 font-retro text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{isKm ? "Combo ខ្ពស់" : "Max Combo"}</span>
            </div>
            <div className="font-retro text-base font-bold text-amber-300 mt-1">
              x{stats.maxCombo}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1 font-retro text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>{isKm ? "រលកធាតុ" : "Shockwaves"}</span>
            </div>
            <div className="font-retro text-base font-bold text-sky-300 mt-1">
              {stats.shockwavesFired}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1 font-retro text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{isKm ? "គ្រាប់បែក" : "Bombs Hit"}</span>
            </div>
            <div className="font-retro text-base font-bold text-rose-400 mt-1">
              {stats.bombsDetonated}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRestart}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:via-cyan-400 hover:to-blue-500 text-white font-retro text-xs sm:text-sm font-bold shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isKm ? "លេងម្ដងទៀត" : "Play Again"}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onChangeMode}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-retro text-[10px] sm:text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isKm ? "ប្តូរកម្រិត" : "Change Mode"}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-retro text-[10px] sm:text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{isKm ? "ទំព័រដើម" : "Home"}</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
