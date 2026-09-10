"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Flame,
  Check,
  ArrowRight,
  Home,
  Sparkles,
  MousePointer,
  Crosshair,
} from "lucide-react";
import { DifficultyLevel, LanguageMode } from "./types";

interface MouseGameModalProps {
  isOpen: boolean;
  selectedLanguage: LanguageMode;
  selectedDifficulty: DifficultyLevel;
  highScore: number;
  onSelectLanguage: (lang: LanguageMode) => void;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onStartGame: () => void;
}

/** Authentic Cambodian Flag SVG */
function CambodiaFlagSvg({ className = "h-6 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 44"
      className={`shrink-0 overflow-hidden rounded-md border border-white/25 shadow-sm ${className}`}
      aria-hidden="true"
    >
      <rect width="64" height="11" fill="#032ea1" />
      <rect y="11" width="64" height="22" fill="#e00025" />
      <rect y="33" width="64" height="11" fill="#032ea1" />
      <g fill="#ffffff">
        <rect x="14" y="27" width="36" height="3" rx="0.5" />
        <rect x="17" y="24" width="30" height="3" rx="0.5" />
        <path d="M 32 12.5 L 29 18.5 L 35 18.5 Z" />
        <rect x="30" y="18.5" width="4" height="5.5" />
        <path d="M 23 15.5 L 21 20.5 L 25 20.5 Z" />
        <rect x="21.5" y="20.5" width="3" height="3.5" />
        <path d="M 41 15.5 L 39 20.5 L 43 20.5 Z" />
        <rect x="39.5" y="20.5" width="3" height="3.5" />
        <rect x="18" y="21.5" width="2" height="2.5" />
        <rect x="44" y="21.5" width="2" height="2.5" />
      </g>
    </svg>
  );
}

/** Authentic United States Flag SVG */
function UsaFlagSvg({ className = "h-6 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 44"
      className={`shrink-0 overflow-hidden rounded-md border border-white/25 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          y={(i * 44) / 13}
          width="64"
          height={44 / 13 + 0.1}
          fill={i % 2 === 0 ? "#b22234" : "#ffffff"}
        />
      ))}
      <rect width="28" height="23.7" fill="#3c3b6e" />
      <g fill="#ffffff" fontSize="4.5" fontFamily="sans-serif" textAnchor="middle">
        <text x="6" y="7">★</text>
        <text x="14" y="7">★</text>
        <text x="22" y="7">★</text>
        <text x="10" y="13.5">★</text>
        <text x="18" y="13.5">★</text>
        <text x="6" y="20">★</text>
        <text x="14" y="20">★</text>
        <text x="22" y="20">★</text>
      </g>
    </svg>
  );
}

export const MouseGameModal: React.FC<MouseGameModalProps> = ({
  isOpen,
  selectedLanguage,
  selectedDifficulty,
  highScore,
  onSelectLanguage,
  onSelectDifficulty,
  onStartGame,
}) => {
  if (!isOpen) return null;

  const isKm = selectedLanguage === "km";

  const difficulties = [
    {
      level: 1 as DifficultyLevel,
      title: isKm ? "កម្រិត ១ ៖ ដាវដំបូង (Novice)" : "Level 1: Novice Blade",
      desc: isKm
        ? "ផ្លែឈើយឺត ពាក្យខ្លីៗ ស្ទើរគ្មានគ្រាប់បែក សមរម្យសម្រាប់ការហាត់"
        : "Gentle speed, simple single words, rare bombs. Perfect for warming up.",
      icon: Sparkles,
      color: "emerald",
      badge: isKm ? "ងាយស្រួល" : "CASUAL",
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400",
      activeBg: "bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-500/30",
    },
    {
      level: 2 as DifficultyLevel,
      title: isKm ? "កម្រិត ២ ៖ អ្នកចម្បាំង (Warrior)" : "Level 2: Blade Warrior",
      desc: isKm
        ? "ល្បឿនមធ្យម ពាក្យផ្លែឈើ គ្រាប់បែកអន្ទាក់ (💣) ត្រូវប្រយ័ត្ន!"
        : "Medium speed, multi-letter words, trap bombs (💣) mixed in.",
      icon: Zap,
      color: "amber",
      badge: isKm ? "មធ្យម" : "NORMAL",
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400",
      activeBg: "bg-amber-500/15 border-amber-400 ring-2 ring-amber-500/30",
    },
    {
      level: 3 as DifficultyLevel,
      title: isKm ? "កម្រិត ៣ ៖ កំពូលនិនចា (Master)" : "Level 3: Grandmaster",
      desc: isKm
        ? "ល្បឿនលឿន ពាក្យជើងអក្សរស្មុគស្មាញ គ្រាប់បែកច្រើន និងផ្លែឈើនាគមាស (🌟)!"
        : "Frenzy speed, complex stacked Khmer syllables, volatile bombs & golden fruits!",
      icon: Flame,
      color: "rose",
      badge: isKm ? "លំបាក" : "HARDCORE",
      accent: "from-rose-500/20 to-purple-500/10 border-rose-500/40 text-rose-400",
      activeBg: "bg-rose-500/15 border-rose-400 ring-2 ring-rose-500/30",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto font-khmer">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/70 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-sky-500/10 font-khmer"
      >
        {/* Top Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-retro text-[10px] font-semibold mb-3 shadow-inner">
            <MousePointer className="w-3.5 h-3.5" />
            <span>
              {isKm
                ? "ហ្គេមបញ្ជាដោយ Mouse & Blade Slicer"
                : "Mouse Blade Slicer Arcade"}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black font-retro text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-indigo-300 tracking-tight">
            {isKm ? "កំពូលដាវកាត់ផ្លែឈើ" : "Mouse Blade Master"}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {isKm
              ? "អូស Mouse កាត់ផ្លែឈើ ចុចស្តាំបញ្ចេញរលកធាតុ និងបង្វិលកង់ដើម្បីពង្រីកដាវ!"
              : "Slice fruits with left-drag, detonate shockwaves with right-click, and resize blade with scroll-wheel!"}
          </p>

          {/* High Score Banner */}
          {highScore > 0 && (
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-retro text-[10px] font-bold">
              <span>👑</span>
              <span>
                {isKm
                  ? `កំណត់ត្រាខ្ពស់បំផុត ៖ ${highScore.toLocaleString()} ពិន្ទុ`
                  : `Personal Best: ${highScore.toLocaleString()} pts`}
              </span>
            </div>
          )}
        </div>

        {/* 1. Language Toggle */}
        <div className="mb-6">
          <div className="font-retro text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>{isKm ? "ជ្រើសរើសភាសា (Language)" : "Select Language"}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSelectLanguage("km")}
              className={`relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 text-left ${
                selectedLanguage === "km"
                  ? "bg-sky-500/15 border-sky-400 shadow-lg shadow-sky-500/15 ring-2 ring-sky-500/30"
                  : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800/90 hover:border-slate-600"
              }`}
            >
              <CambodiaFlagSvg className="h-7 w-9" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>ភាសាខ្មែរ</span>
                  {selectedLanguage === "km" && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <div className="text-xs text-slate-300 truncate">
                  ព្យញ្ជនៈ ស្រៈ និងជើងអក្សរ
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectLanguage("en")}
              className={`relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 text-left ${
                selectedLanguage === "en"
                  ? "bg-sky-500/15 border-sky-400 shadow-lg shadow-sky-500/15 ring-2 ring-sky-500/30"
                  : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800/90 hover:border-slate-600"
              }`}
            >
              <UsaFlagSvg className="h-7 w-9" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>English</span>
                  {selectedLanguage === "en" && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <div className="text-xs text-slate-300 truncate">
                  Vocabulary & Arcade terms
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Difficulty Tiers */}
        <div className="mb-6">
          <div className="font-retro text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>{isKm ? "កម្រិតពិបាក (Difficulty)" : "Select Difficulty"}</span>
          </div>

          <div className="space-y-2.5">
            {difficulties.map((diff) => {
              const Icon = diff.icon;
              const isSelected = selectedDifficulty === diff.level;
              return (
                <button
                  key={diff.level}
                  type="button"
                  onClick={() => onSelectDifficulty(diff.level)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 text-left ${
                    isSelected
                      ? diff.activeBg
                      : "bg-slate-800/50 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isSelected
                          ? `bg-${diff.color}-500/25 border-${diff.color}-400 text-white`
                          : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{diff.title}</span>
                        <span
                          className={`font-retro text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-md font-bold border ${
                            isSelected
                              ? `bg-${diff.color}-500/30 border-${diff.color}-400 text-white`
                              : "bg-slate-800 border-slate-700 text-slate-400"
                          }`}
                        >
                          {diff.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">{diff.desc}</div>
                    </div>
                  </div>

                  <div className="pl-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-sky-400 bg-sky-500 text-white"
                          : "border-slate-600 bg-slate-800 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Mouse Controls Cheatsheet */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="font-retro text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span>{isKm ? "វិធីបញ្ជា Mouse (Controls)" : "Mouse Controls"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-base">🖱️</span>
              <div>
                <div className="font-bold text-sky-300">
                  {isKm ? "ចុចអូស Mouse ឆ្វេង" : "Left-Click Drag"}
                </div>
                <div className="text-slate-300 text-[11px]">
                  {isKm ? "កាត់ផ្លែឈើជាពីរ" : "Continuous blade slice"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-base">💥</span>
              <div>
                <div className="font-bold text-cyan-300">
                  {isKm ? "ចុច Mouse ស្តាំ" : "Right-Click"}
                </div>
                <div className="text-slate-300 text-[11px]">
                  {isKm ? "រលកធាតុបំផ្លាញ & បញ្ចៀសគ្រាប់បែក" : "360° Shockwave pulse"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-base">🔄</span>
              <div>
                <div className="font-bold text-amber-300">
                  {isKm ? "បង្វិលកង់ Mouse" : "Scroll Wheel"}
                </div>
                <div className="text-slate-300 text-[11px]">
                  {isKm ? "ប្តូរទំហំផ្លែដាវ (24-76px)" : "Resize blade width"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-retro text-[10px] sm:text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{isKm ? "ទំព័រដើម" : "Home"}</span>
          </Link>

          <button
            type="button"
            onClick={onStartGame}
            className="w-full flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:via-cyan-400 hover:to-blue-500 text-white font-retro text-xs sm:text-sm font-bold shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>{isKm ? "ចាប់ផ្ដើមកាប់ដាវឥឡូវនេះ" : "Unsheathe Blade & Play"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
