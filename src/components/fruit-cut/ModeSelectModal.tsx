"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Swords,
  Zap,
  Flame,
  Check,
  ArrowRight,
  ShieldCheck,
  Home,
  Sparkles,
} from "lucide-react";
import { DifficultyLevel, LanguageMode } from "./types";

interface ModeSelectModalProps {
  isOpen: boolean;
  selectedLanguage: LanguageMode;
  selectedDifficulty: DifficultyLevel;
  onSelectLanguage: (lang: LanguageMode) => void;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onStartGame: () => void;
}

/** Authentic Cambodian Flag SVG with Angkor Wat silhouette */
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
      {/* Angkor Wat Silhouette */}
      <g fill="#ffffff">
        <rect x="14" y="27" width="36" height="3" rx="0.5" />
        <rect x="17" y="24" width="30" height="3" rx="0.5" />
        {/* Main central tower */}
        <path d="M 32 12.5 L 29 18.5 L 35 18.5 Z" />
        <rect x="30" y="18.5" width="4" height="5.5" />
        {/* Left tower */}
        <path d="M 23 15.5 L 21 20.5 L 25 20.5 Z" />
        <rect x="21.5" y="20.5" width="3" height="3.5" />
        {/* Right tower */}
        <path d="M 41 15.5 L 39 20.5 L 43 20.5 Z" />
        <rect x="39.5" y="20.5" width="3" height="3.5" />
        {/* Minor outer spires */}
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

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  selectedLanguage,
  selectedDifficulty,
  onSelectLanguage,
  onSelectDifficulty,
  onStartGame,
}) => {
  if (!isOpen) return null;

  const isKm = selectedLanguage === "km";

  const difficultyCards = [
    {
      level: 1 as DifficultyLevel,
      titleKm: "កម្រិត ១៖ ដំបូង (Basic)",
      titleEn: "Level 1: Basic",
      descKm: "ព្យញ្ជនៈខ្មែរទាំង ៣៣ និងស្រៈងាយៗ (ក, ខ, គ, កា, កី...)",
      descEn: "Single letters & quick 3-letter words (A-Z, CAT, SUN, RUN...)",
      speed: isKm ? "ល្បឿនយឺត" : "Slow speed",
      icon: ShieldCheck,
      badgeColor: "from-emerald-500 to-teal-600",
      activeRing:
        "border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/25",
      accentColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
    },
    {
      level: 2 as DifficultyLevel,
      titleKm: "កម្រិត ២៖ មធ្យម (Intermediate)",
      titleEn: "Level 2: Intermediate",
      descKm: "ពាក្យទូទៅ និងឈ្មោះផ្លែឈើ (ផ្លែឈើ, ចេក, ក្រូច, ឪឡឹក...)",
      descEn: "4-6 letter arcade words (FRUIT, SLASH, BLADE, APPLE...)",
      speed: isKm ? "ល្បឿនមធ្យម" : "Moderate speed",
      icon: Zap,
      badgeColor: "from-amber-500 to-orange-600",
      activeRing:
        "border-amber-400 bg-amber-500/20 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/25",
      accentColor: "text-amber-400",
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-400/30",
    },
    {
      level: 3 as DifficultyLevel,
      titleKm: "កម្រិត ៣៖ ជាន់ខ្ពស់ (Advanced)",
      titleEn: "Level 3: Advanced",
      descKm: "ពាក្យមានជើង និងស្រៈផ្សំ (សង្ក្រាន្ត, ព្រះច័ន្ទ, វប្បធម៌...)",
      descEn: "Long compound words (WATERMELON, DRAGONFRUIT, LIGHTNING...)",
      speed: isKm ? "ល្បឿនលឿន" : "High speed",
      icon: Flame,
      badgeColor: "from-purple-500 to-rose-600",
      activeRing:
        "border-purple-400 bg-purple-500/20 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25",
      accentColor: "text-purple-400",
      iconBg: "bg-purple-500/20 text-purple-400 border-purple-400/30",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-khmer">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-5 sm:p-7 text-white shadow-2xl shadow-emerald-950/40 font-khmer"
      >
        {/* Glow backdrop behind modal header */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-r from-emerald-500/30 via-amber-500/30 to-rose-500/30 blur-3xl pointer-events-none" />

        {/* Top bar: Back to Home button + Tag */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:border-emerald-400/50 hover:bg-white/15 hover:text-white"
            title="Return to Home"
          >
            <Home className="h-3.5 w-3.5 text-emerald-400 transition-transform group-hover:-translate-x-0.5" />
            <span>{isKm ? "ទំព័រដើម" : "Home"}</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 shadow-xs">
            <Swords className="h-3.5 w-3.5" />
            <span>Arcade Typing</span>
          </div>
        </div>

        {/* Title & Game branding */}
        <div className="text-center mb-6">
          <h1 className="font-retro text-xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            {isKm ? "កាត់ផ្លែឈើវាយអក្សរ" : "Khmer Word Slicer"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {isKm
              ? "វាយតួអក្សរ ឬពាក្យលើផ្លែឈើដែលកំពុងហោះ ដើម្បីកាត់កម្ទេចពួកវាមុននឹងធ្លាក់ចុះ!"
              : "Slice airborne fruits by typing words before they hit the ground!"}
          </p>
        </div>

        {/* 1. Language Selection Tabs */}
        <div className="mb-5">
          <label className="block font-retro text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {isKm ? "១. ជ្រើសរើសភាសា (Select Language)" : "1. Select Language Mode"}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Khmer Unicode Button */}
            <button
              type="button"
              onClick={() => onSelectLanguage("km")}
              className={`group relative flex items-center justify-between gap-3 rounded-2xl border p-3 sm:p-3.5 transition-all text-left ${
                selectedLanguage === "km"
                  ? "border-emerald-400 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20 text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <CambodiaFlagSvg className="h-6 w-9" />
                <div>
                  <div className="text-sm sm:text-base font-bold text-white leading-tight">
                    ភាសាខ្មែរ
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Khmer Unicode
                  </div>
                </div>
              </div>

              {/* Radio Checkmark */}
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  selectedLanguage === "km"
                    ? "border-emerald-400 bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40"
                    : "border-white/20 bg-white/5"
                }`}
              >
                {selectedLanguage === "km" && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
            </button>

            {/* English Button */}
            <button
              type="button"
              onClick={() => onSelectLanguage("en")}
              className={`group relative flex items-center justify-between gap-3 rounded-2xl border p-3 sm:p-3.5 transition-all text-left ${
                selectedLanguage === "en"
                  ? "border-amber-400 bg-gradient-to-r from-amber-500/20 to-orange-500/10 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20 text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <UsaFlagSvg className="h-6 w-9" />
                <div>
                  <div className="text-sm sm:text-base font-bold text-white leading-tight">
                    English
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">
                    QWERTY Speed
                  </div>
                </div>
              </div>

              {/* Radio Checkmark */}
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  selectedLanguage === "en"
                    ? "border-amber-400 bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40"
                    : "border-white/20 bg-white/5"
                }`}
              >
                {selectedLanguage === "en" && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>

        {/* 2. Difficulty Tiers */}
        <div className="mb-6">
          <label className="block font-retro text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {isKm ? "២. ជ្រើសរើសកម្រិតពិបាក (Difficulty)" : "2. Select Difficulty Tier"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficultyCards.map((card) => {
              const isSelected = selectedDifficulty === card.level;
              const Icon = card.icon;
              return (
                <button
                  key={card.level}
                  type="button"
                  onClick={() => onSelectDifficulty(card.level)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? card.activeRing
                      : "border-white/10 bg-white/5 opacity-85 hover:opacity-100 hover:border-white/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md bg-gradient-to-r ${card.badgeColor} px-2 py-0.5 text-[10px] font-bold uppercase text-white tracking-wide shadow-xs`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{card.speed}</span>
                      </span>

                      {/* Selection radio */}
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-white bg-white text-slate-950 shadow-xs"
                            : "border-white/20 bg-white/5"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                      {isKm ? card.titleKm : card.titleEn}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                      {isKm ? card.descKm : card.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pro Tip Callout Box */}
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2.5 shadow-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300">
              {isKm ? "គន្លឹះពិសេស៖" : "Pro Tip:"}
            </span>{" "}
            {isKm
              ? "វាយតាមលំដាប់អក្សរខ្មែរ (ព្យញ្ជនៈ + ជើង '្' + ស្រៈ)។ អក្សរដែលត្រូវនឹងប្រែពណ៌បៃតងភ្លាមៗ!"
              : "Type characters on any flying fruit. Typed letters turn green immediately. String together quick slices for combo multipliers!"}
          </div>
        </div>

        {/* Start Game Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onStartGame}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 py-3.5 sm:py-4 font-retro font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 text-sm sm:text-base border border-emerald-300/40 cursor-pointer"
        >
          <Swords className="h-5 w-5 animate-pulse" />
          <span>{isKm ? "ចាប់ផ្ដើមកាត់ផ្លែឈើ" : "START SLICING NOW"}</span>
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

