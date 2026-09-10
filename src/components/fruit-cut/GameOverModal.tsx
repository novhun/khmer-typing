"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  RotateCcw,
  Home,
  Sparkles,
  Target,
  Flame,
  SlidersHorizontal,
} from "lucide-react";
import { GameStats, LanguageMode } from "./types";

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  language: LanguageMode;
  onRestart: () => void;
  onOpenMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  language,
  onRestart,
  onOpenMenu,
}) => {
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  const isKm = language === "km";

  // Calculate Accuracy
  const accuracy =
    stats.totalTypedKeystrokes > 0
      ? Math.round(
          (stats.correctTypedKeystrokes / stats.totalTypedKeystrokes) * 100
        )
      : 100;

  // Track high score in localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem("fc:highscore");
      const prevHigh = stored ? parseInt(stored, 10) : 0;
      if (stats.score > prevHigh) {
        localStorage.setItem("fc:highscore", String(stats.score));
        setHighScore(stats.score);
        setIsNewRecord(true);
      } else {
        setHighScore(prevHigh);
        setIsNewRecord(false);
      }
    } catch {
      setHighScore(stats.score);
    }
  }, [isOpen, stats.score]);

  if (!isOpen) return null;

  // Rank determination
  const getRank = () => {
    if (stats.score >= 5000) {
      return {
        titleKm: "កំពូលនិនចាកាត់ផ្លែឈើ",
        titleEn: "Grandmaster Blade Ninja",
        color: "from-amber-400 to-yellow-500",
      };
    }
    if (stats.score >= 2500) {
      return {
        titleKm: "អ្នកជំនាញដាវមុតស្រួច",
        titleEn: "Master Fruit Slicer",
        color: "from-emerald-400 to-teal-500",
      };
    }
    if (stats.score >= 1000) {
      return {
        titleKm: "អ្នកកាត់ផ្លែឈើកម្រិតមធ្យម",
        titleEn: "Adept Blade Striker",
        color: "from-blue-400 to-indigo-500",
      };
    }
    return {
      titleKm: "អ្នកហាត់ដាវដំបូង",
      titleEn: "Apprentice Slicer",
      color: "from-slate-300 to-slate-400",
    };
  };

  const rank = getRank();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-khmer">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 text-white shadow-2xl shadow-red-950/40 font-khmer"
      >
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-500/20 blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 font-retro text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-400 mb-2.5">
            <span>{isKm ? "ចប់ការប្រកួត" : "GAME OVER"}</span>
          </div>

          <h2 className="font-retro text-xl sm:text-2xl font-black text-white">
            {isKm ? "លទ្ធផលកាត់ផ្លែឈើ" : "Slicing Results"}
          </h2>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-retro text-[10px] sm:text-xs font-semibold text-slate-300">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>{isKm ? rank.titleKm : rank.titleEn}</span>
          </div>
        </div>

        {/* Score & High Score */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-5 text-center relative overflow-hidden">
          {isNewRecord && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 font-retro text-[9px] sm:text-[10px] font-black uppercase text-amber-300 border border-amber-500/40 animate-pulse">
              <Sparkles className="h-3 w-3" />
              <span>{isKm ? "ឯកទគ្គកម្មថ្មី!" : "New High Score!"}</span>
            </div>
          )}

          <div className="font-retro text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
            {isKm ? "ពិន្ទុសរុបរបស់អ្នក" : "Final Score"}
          </div>
          <div className="font-retro text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
            {stats.score.toLocaleString()}
          </div>

          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5 font-retro">
            <span className="text-[10px] sm:text-xs">{isKm ? "ពិន្ទុខ្ពស់បំផុត:" : "High Score:"}</span>
            <span className="font-bold text-slate-200 text-xs sm:text-sm">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {/* Sliced Count */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <span className="text-2xl mb-1">🍉</span>
            <div className="font-retro text-base sm:text-lg font-bold text-white">
              {stats.slicedCount}
            </div>
            <div className="font-retro text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">
              {isKm ? "ផ្លែឈើកាត់បាន" : "Fruits Sliced"}
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <Target className="h-5 w-5 text-emerald-400 mb-1" />
            <div className="font-retro text-base sm:text-lg font-bold text-emerald-400">
              {accuracy}%
            </div>
            <div className="font-retro text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">
              {isKm ? "ភាពសុក្រឹត" : "Accuracy"}
            </div>
          </div>

          {/* Max Combo */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <Flame className="h-5 w-5 text-amber-400 mb-1" />
            <div className="font-retro text-base sm:text-lg font-bold text-amber-400">
              x{stats.maxCombo}
            </div>
            <div className="font-retro text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">
              {isKm ? "កុំបូខ្ពស់បំផុត" : "Max Combo"}
            </div>
          </div>
        </div>

        {/* Action Buttons: Play Again, Change Mode, Return Home */}
        <div className="flex flex-col gap-2.5 font-retro text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Play Again */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{isKm ? "លេងម្ដងទៀត" : "Play Again"}</span>
            </motion.button>

            {/* Mode Menu */}
            <button
              type="button"
              onClick={onOpenMenu}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 font-bold text-slate-200 transition-colors hover:border-emerald-400/40 hover:bg-white/15 hover:text-white cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <span>{isKm ? "ប្តូរកម្រិត / ភាសា" : "Change Mode"}</span>
            </button>
          </div>

          {/* Return to Home link */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <Home className="h-3.5 w-3.5 text-slate-400" />
            <span>{isKm ? "ត្រឡប់ទៅទំព័រដើម (All Programs)" : "Return to Home Hub"}</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
