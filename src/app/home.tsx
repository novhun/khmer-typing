"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Swords,
  BookOpen,
  Keyboard,
  Sparkles,
  Trophy,
  Zap,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Menu,
  X,
  MousePointer,
  Search,
} from "lucide-react";

import { useApp } from "@/context/AppProviders";
import { usePwa } from "@/context/PwaContext";
import { TypingGame } from "@/components/TypingGame";
import { CustomLessonDialog } from "@/components/CustomLessonDialog";
import { GuideDialog } from "@/components/GuideDialog";
import { MISSIONS, type Mission } from "@/lib/missions";
import { STORAGE_KEYS, readJson, readStorage, writeJson } from "@/lib/storage";
import { getPlayerRank } from "@/lib/rank";

export default function Home() {
  const { t, lang, toggleLang, theme, toggleTheme, soundOn, toggleSound } = useApp();
  const { isInstallable, installApp } = usePwa();

  // Mode: 'programs' (Welcome & Program Selection hub) or 'quest' (Typing Quest)
  const [activeView, setActiveView] = useState<"programs" | "quest">("programs");

  // Mobile navigation menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [helpOpen, setHelpOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Stored stats for quick progress banner
  const [clearedCount, setClearedCount] = useState<number>(0);
  const [highestWpm, setHighestWpm] = useState<number>(0);
  const [customCount, setCustomCount] = useState<number>(0);

  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "typing" | "defense" | "mouse" | "studio"
  >("all");

  const playerRank = useMemo(
    () => getPlayerRank(clearedCount, highestWpm),
    [clearedCount, highestWpm]
  );

  const programsData = useMemo(
    () => [
      {
        id: "quest",
        category: "typing" as const,
        title: t("home.programs.quest.title"),
        subtitle: t("home.programs.quest.subtitle"),
        desc: t("home.programs.quest.desc"),
        tag: t("home.programs.quest.tag"),
        keywords:
          "quest mario touch typing unicode nida consonants coeng ជើងអក្សរ ព្យញ្ជនៈ ល្បែងផ្សងព្រេង វាយអក្សរ",
      },
      {
        id: "fruitCut",
        category: "typing" as const,
        title: t("home.programs.fruitCut.title"),
        subtitle: t("home.programs.fruitCut.subtitle"),
        desc: t("home.programs.fruitCut.desc"),
        tag: t("home.programs.fruitCut.tag"),
        keywords:
          "fruit cut slicer ninja watermelon combo physics gravity កាត់ផ្លែឈើ ឪឡឹក វាយអក្សរ",
      },
      {
        id: "zombie",
        category: "defense" as const,
        title: t("home.programs.zombie.title"),
        subtitle: t("home.programs.zombie.subtitle"),
        desc: t("home.programs.zombie.desc"),
        tag: t("home.programs.zombie.tag"),
        keywords:
          "zombie defense bunker plasma turret lane shield horde waves ខ្មោចឆៅ ការពារបន្ទាយ វាយអក្សរ",
      },
      {
        id: "mouseGame",
        category: "mouse" as const,
        title: t("home.programs.mouseGame.title"),
        subtitle: t("home.programs.mouseGame.subtitle"),
        desc: t("home.programs.mouseGame.desc"),
        tag: t("home.programs.mouseGame.tag"),
        keywords:
          "mouse blade slicer shockwave wheel scroll click drag ហ្វឹកហាត់ mouse កាត់ផ្លែឈើ",
      },
      {
        id: "custom",
        category: "studio" as const,
        title: t("home.programs.custom.title"),
        subtitle: t("home.programs.custom.subtitle"),
        desc: t("home.programs.custom.desc"),
        tag: t("home.programs.custom.tag"),
        keywords:
          "custom lesson studio import txt wpm personal drill មេរៀនផ្ទាល់ខ្លួន",
      },
      {
        id: "guide",
        category: "studio" as const,
        title: t("home.programs.guide.title"),
        subtitle: t("home.programs.guide.subtitle"),
        desc: t("home.programs.guide.desc"),
        tag: t("home.programs.guide.tag"),
        keywords:
          "nida keyboard guide rules coeng shift layout unicode តារាងក្ដារចុច ជើងអក្សរ ការណែនាំ",
      },
    ],
    [t]
  );

  const visibleProgramIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return new Set(
      programsData
        .filter((p) => {
          if (selectedCategory !== "all" && p.category !== selectedCategory) {
            return false;
          }
          if (!q) return true;
          return (
            p.title.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q) ||
            p.tag.toLowerCase().includes(q) ||
            p.keywords.toLowerCase().includes(q)
          );
        })
        .map((p) => p.id)
    );
  }, [programsData, selectedCategory, searchQuery]);

  useEffect(() => {
    try {
      const cleared = readJson<string[]>(STORAGE_KEYS.cleared, []);
      setClearedCount(cleared.length);

      const customMissions = readJson<Mission[]>(STORAGE_KEYS.customMissions, []);
      setCustomCount(customMissions.length);

      let maxWpm = 0;
      for (const m of [...MISSIONS, ...customMissions]) {
        const raw = readStorage(STORAGE_KEYS.best(m.id));
        if (raw !== null) {
          const n = Number(raw);
          if (Number.isFinite(n) && n > maxWpm) {
            maxWpm = n;
          }
        }
      }
      setHighestWpm(maxWpm);
    } catch {
      // ignore
    }
  }, [activeView]);

  const handleSaveCustom = (newMission: Mission) => {
    try {
      const existing = readJson<Mission[]>(STORAGE_KEYS.customMissions, []);
      const updated = [newMission, ...existing];
      writeJson(STORAGE_KEYS.customMissions, updated);
      setCustomCount(updated.length);
      setCustomModalOpen(false);
      setActiveView("quest");
    } catch {
      setCustomModalOpen(false);
    }
  };

  // If player launched Typing Quest, render it with option to return
  if (activeView === "quest") {
    return (
      <div className="relative min-h-screen bg-[var(--sky-bottom)] text-[var(--ink)]">
        {/* Top Floating Bar to return to Program Selection */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-[var(--panel)]/90 px-3 sm:px-4 py-2 backdrop-blur-md shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView("programs")}
              className="pixel-btn focus-ring inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--key-face)] text-[var(--key-ink)] px-2.5 py-1.5 font-retro text-[10px] sm:text-[11px] uppercase leading-none transition-colors hover:brightness-110 cursor-pointer"
            >
              <span>◀</span>
              <span className="hidden sm:inline">{t("home.switchProgram")}</span>
            </button>

            <Link
              href="/games/fruit-cut"
              className="pixel-btn focus-ring inline-flex items-center gap-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-2.5 py-1.5 font-retro text-[10px] sm:text-[11px] uppercase leading-none transition-colors"
              title={t("home.menu.fruitCut")}
            >
              <span>⚔️</span>
              <span className="hidden sm:inline">{t("home.menu.fruitCut")}</span>
            </Link>

            <Link
              href="/games/zombie"
              className="pixel-btn focus-ring inline-flex items-center gap-1.5 rounded-[4px] bg-red-600 hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600 text-white px-2.5 py-1.5 font-retro text-[10px] sm:text-[11px] uppercase leading-none transition-colors"
              title={t("home.menu.zombie")}
            >
              <span>🧟</span>
              <span className="hidden sm:inline">{t("home.menu.zombie")}</span>
            </Link>

            <Link
              href="/games/using-mouse"
              className="pixel-btn focus-ring inline-flex items-center gap-1.5 rounded-[4px] bg-sky-600 hover:bg-sky-500 dark:bg-sky-700 dark:hover:bg-sky-600 text-white px-2.5 py-1.5 font-retro text-[10px] sm:text-[11px] uppercase leading-none transition-colors"
              title={t("home.menu.mouseGame")}
            >
              <span>🖱️</span>
              <span className="hidden sm:inline">{t("home.menu.mouseGame")}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="font-retro text-[9px] sm:text-[10px] text-amber-500 font-bold">QUEST ACTIVE</span>
          </div>
        </div>

        <TypingGame onBackToHome={() => setActiveView("programs")} />
      </div>
    );
  }

  // Welcome Page & Program Select Hub
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white selection:bg-emerald-500 selection:text-white transition-colors duration-200 font-khmer">
      {/* Dynamic Background Decorative Gradients (Light and Dark tailored) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-emerald-300/25 dark:bg-emerald-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-amber-300/25 dark:bg-amber-500/10 blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-sky-300/30 dark:bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-4 py-5 sm:px-6 lg:px-8">
        {/* 1. Header Bar with Navigation Menu */}
        <header className="border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-400 to-yellow-500 text-xl font-black text-slate-950 shadow-md shadow-amber-500/20 font-retro">
                ?
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-retro text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
                    {t("app.title")}
                  </span>
                  <span className="rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-400 px-1.5 py-0.5 font-retro text-[9px] font-black uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("app.subtitle")}</p>
              </div>
            </div>

            {/* Desktop Navigation Menu Links */}
            <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/70 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveView("quest")}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-retro text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Gamepad2 className="h-3.5 w-3.5 text-amber-500" />
                <span>{t("home.menu.quest")}</span>
              </button>

              <Link
                href="/games/fruit-cut"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-retro text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <Swords className="h-3.5 w-3.5 text-emerald-500" />
                <span>{t("home.menu.fruitCut")}</span>
              </Link>

              <Link
                href="/games/zombie"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-retro text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                <span>{t("home.menu.zombie")}</span>
              </Link>

              <Link
                href="/games/using-mouse"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-retro text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <MousePointer className="h-3.5 w-3.5 text-sky-500" />
                <span>{t("home.menu.mouseGame")}</span>
              </Link>

              <button
                type="button"
                onClick={() => setCustomModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-retro text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-teal-500" />
                <span>{t("home.menu.custom")}</span>
              </button>

              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-retro text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Keyboard className="h-3.5 w-3.5 text-blue-500" />
                <span>{t("home.menu.guide")}</span>
              </button>
            </nav>

            {/* Controls: Language, Theme Toggle, Sound, PWA, Mobile Hamburger */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLang}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white/80 dark:border-white/10 dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white backdrop-blur-md transition-all hover:border-emerald-500 hover:bg-slate-100 dark:hover:bg-white/10 shadow-xs"
                title={t("nav.switchTo")}
              >
                <span className="text-base">{lang === "en" ? "🇰🇭" : "🇺🇸"}</span>
                <span className={lang === "en" ? "font-khmer font-bold" : "font-bold"}>
                  {lang === "en" ? "ភាសាខ្មែរ" : "English"}
                </span>
              </button>

              {/* Theme Toggle (Light / Dark) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white/80 dark:border-white/10 dark:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white shadow-xs"
                title={theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
                aria-label="Toggle light or dark theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600" />
                )}
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white/80 dark:border-white/10 dark:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white shadow-xs"
                title={soundOn ? t("nav.soundOff") : t("nav.soundOn")}
                aria-label="Toggle Sound"
              >
                {soundOn ? (
                  <Volume2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-red-500" />
                )}
              </button>

              {/* PWA Install Button */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={installApp}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 shadow-xs"
                  title={t("pwa.installTitle")}
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>{t("pwa.install")}</span>
                </button>
              )}

              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white/80 dark:border-white/10 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 shadow-xs"
                title="Toggle Menu"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden lg:hidden mt-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xl"
              >
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveView("quest");
                    }}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-left font-retro text-[11px] font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Gamepad2 className="h-4 w-4 text-amber-500" />
                    <span>{t("home.menu.quest")}</span>
                  </button>

                  <Link
                    href="/games/fruit-cut"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-left font-retro text-[11px] font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Swords className="h-4 w-4 text-emerald-500" />
                    <span>{t("home.menu.fruitCut")}</span>
                  </Link>

                  <Link
                    href="/games/zombie"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-left font-retro text-[11px] font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <span>{t("home.menu.zombie")}</span>
                  </Link>

                  <Link
                    href="/games/using-mouse"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-left font-retro text-[11px] font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <MousePointer className="h-4 w-4 text-sky-500" />
                    <span>{t("home.menu.mouseGame")}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCustomModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-left font-retro text-[11px] font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 text-teal-500" />
                    <span>{t("home.menu.custom")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setHelpOpen(true);
                    }}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-left font-retro text-[11px] font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Keyboard className="h-4 w-4 text-blue-500" />
                    <span>{t("home.menu.guide")}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* 2. Hero Welcome Section */}
        <section className="py-10 text-center sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 font-retro text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 mb-5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{t("home.welcomeBadge")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-retro text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-normal sm:leading-relaxed md:leading-normal max-w-5xl mx-auto"
          >
            <span className="bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 dark:from-amber-300 dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent inline-block pb-1.5 drop-shadow-xs">
              {t("home.heroTitle1")}
            </span>
            <br />
            <span className="text-slate-900 dark:text-white drop-shadow-xs dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.2)] inline-block pt-1.5">
              {t("home.heroTitle2")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          {/* Quick Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-semibold"
          >
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 px-3.5 py-1.5 font-retro text-[9px] sm:text-[10px] text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("home.featureFree")}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 px-3.5 py-1.5 font-retro text-[9px] sm:text-[10px] text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span>{t("home.featureOffline")}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 px-3.5 py-1.5 font-retro text-[9px] sm:text-[10px] text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-md">
              <Keyboard className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span>{t("home.featureNida")}</span>
            </div>
          </motion.div>
        </section>

        {/* 3. Player Stats & Arcade Rank Banner */}
        <div className="mb-10 rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-white to-emerald-50 dark:border-amber-400/20 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-slate-900 dark:to-emerald-500/10 p-5 shadow-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Rank Badge Box */}
              <div
                className={`flex flex-col items-center justify-center rounded-2xl border ${playerRank.borderClass} ${playerRank.bgClass} px-3.5 py-2 text-center shrink-0 ${playerRank.badgeGlow}`}
              >
                <span className="font-retro text-[8px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("home.rank.tier")}
                </span>
                <span
                  className={`font-retro text-2xl font-black ${playerRank.colorClass}`}
                >
                  {playerRank.tier}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-retro text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t(playerRank.nameKey)}
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 font-retro text-[9px] text-amber-800 dark:text-amber-300 font-bold">
                    <Trophy className="h-3 w-3 text-amber-500" />
                    <span>{t("home.rank.title")}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                  <span>
                    {t("home.stats.clearedMissions")}:{" "}
                    <strong className="font-retro text-xs text-emerald-700 dark:text-emerald-400 font-extrabold">
                      {clearedCount}/18
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    {t("home.stats.bestWpm")}:{" "}
                    <strong className="font-retro text-xs text-amber-700 dark:text-amber-400 font-extrabold">
                      {highestWpm} WPM
                    </strong>
                  </span>
                  {customCount > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {t("home.stats.customLessons")}:{" "}
                        <strong className="font-retro text-xs text-teal-700 dark:text-teal-400 font-extrabold">
                          {customCount}
                        </strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Progress bar towards next tier */}
                <div className="mt-2.5 max-w-md">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                    <span>
                      {playerRank.nextTier
                        ? t("home.rank.next", {
                            nextTier: `Tier ${playerRank.nextTier}`,
                            target: `${playerRank.targetCleared} ${t("home.stats.clearedMissions")} & ${playerRank.targetWpm} WPM`,
                          })
                        : t("home.rank.max")}
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {playerRank.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 transition-all duration-500"
                      style={{ width: `${playerRank.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => setActiveView("quest")}
              className="flex items-center gap-2 rounded-xl bg-amber-500 dark:bg-amber-400 px-4 py-2.5 font-retro text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer shrink-0 self-stretch sm:self-auto justify-center"
            >
              <span>
                {clearedCount > 0
                  ? t("home.stats.continueQuest")
                  : t("home.programs.quest.action")}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Select Program Section */}
        <section className="mb-12">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-retro text-slate-900 dark:text-white tracking-tight">
                {t("home.selectProgramHeading")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("home.selectProgramSub")}
              </p>
            </div>
            {searchQuery && (
              <span className="font-retro text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {t("home.search.resultsCount", { count: visibleProgramIds.size })}
              </span>
            )}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("home.search.placeholder")}
                className="w-full rounded-2xl border border-slate-300 bg-white/90 dark:border-white/10 dark:bg-slate-900/90 pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 backdrop-blur-md transition-all font-khmer"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { key: "all" as const, label: t("home.search.all") },
                { key: "typing" as const, label: t("home.search.typing") },
                { key: "defense" as const, label: t("home.search.defense") },
                { key: "mouse" as const, label: t("home.search.mouse") },
                { key: "studio" as const, label: t("home.search.studio") },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`rounded-xl px-3 py-1.5 font-retro text-[9px] sm:text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    selectedCategory === tab.key
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                      : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty Search Fallback */}
          {visibleProgramIds.size === 0 && (
            <div className="mb-8 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center bg-white/40 dark:bg-white/5">
              <Search className="h-8 w-8 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {t("home.search.noResults", { query: searchQuery })}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-retro text-xs font-bold text-white hover:bg-emerald-500 shadow-sm cursor-pointer"
              >
                {t("home.search.reset")}
              </button>
            </div>
          )}

          {/* Main 4 Arcade Games Grid */}
          {(visibleProgramIds.has("quest") ||
            visibleProgramIds.has("fruitCut") ||
            visibleProgramIds.has("zombie") ||
            visibleProgramIds.has("mouseGame")) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {/* PROGRAM 1: Typing Quest (Mario Platformer) */}
              {visibleProgramIds.has("quest") && (
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col justify-between rounded-3xl border border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-white dark:border-amber-500/30 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 p-6 shadow-lg shadow-amber-500/10 dark:shadow-xl dark:shadow-amber-950/20"
                >
              <div className="absolute top-0 right-0 h-40 w-40 bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-100 text-amber-900 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-300 px-3 py-1 font-retro text-[9px] sm:text-[10px] font-black uppercase tracking-wide">
                    <Gamepad2 className="h-3.5 w-3.5" />
                    <span>{t("home.programs.quest.tag")}</span>
                  </span>
                  <span className="font-retro text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    {t("home.programs.quest.levels")}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-retro text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  {t("home.programs.quest.title")}
                </h3>
                <p className="mt-1 text-xs font-semibold text-amber-800 dark:text-amber-400/90">
                  {t("home.programs.quest.subtitle")}
                </p>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t("home.programs.quest.desc")}
                </p>

                {/* Features list */}
                <div className="mt-4 grid grid-cols-2 gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 font-black">✓</span>
                    <span>33 ព្យញ្ជនៈ & ជើង</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 font-black">✓</span>
                    <span>NiDA Virtual Key</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 font-black">✓</span>
                    <span>Finger Guide</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 font-black">✓</span>
                    <span>WPM Accuracy</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveView("quest")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 py-3 font-retro text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/30 active:scale-98 cursor-pointer"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>{t("home.programs.quest.action")}</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </motion.div>
          )}

            {/* PROGRAM 2: Khmer Word Slicer (Fruit Ninja Arcade) */}
            {visibleProgramIds.has("fruitCut") && (
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-emerald-300 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:border-emerald-500/30 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 p-6 shadow-lg shadow-emerald-500/10 dark:shadow-xl dark:shadow-emerald-950/20"
              >
                <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-100 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300 px-3 py-1 font-retro text-[9px] sm:text-[10px] font-black uppercase tracking-wide">
                      <Swords className="h-3.5 w-3.5" />
                      <span>{t("home.programs.fruitCut.tag")}</span>
                    </span>
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      🍉 🍊 🍍 🍓
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-retro text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {t("home.programs.fruitCut.title")}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400/90">
                    {t("home.programs.fruitCut.subtitle")}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("home.programs.fruitCut.desc")}
                  </p>

                  {/* Features list */}
                  <div className="mt-4 grid grid-cols-2 gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>
                      <span>Physics Gravity</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>
                      <span>Juice Splatters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>
                      <span>Combo Streaks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>
                      <span>3 Speed Tiers</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                  <Link
                    href="/games/fruit-cut"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-retro text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-98 cursor-pointer"
                  >
                    <Swords className="h-4 w-4" />
                    <span>{t("home.programs.fruitCut.action")}</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* PROGRAM 3: Zombie Typing Defense (Bunker Defense Arcade) */}
            {visibleProgramIds.has("zombie") && (
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-red-300 bg-gradient-to-b from-red-50/70 via-white to-white dark:border-red-500/30 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 p-6 shadow-lg shadow-red-500/10 dark:shadow-xl dark:shadow-red-950/20"
              >
                <div className="absolute top-0 right-0 h-40 w-40 bg-red-400/10 dark:bg-red-500/10 blur-3xl pointer-events-none rounded-full" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/50 bg-red-100 text-red-900 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-300 px-3 py-1 font-retro text-[9px] sm:text-[10px] font-black uppercase tracking-wide">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>{t("home.programs.zombie.tag")}</span>
                    </span>
                    <span className="font-mono text-xs text-red-600 dark:text-red-400 font-bold">
                      🧟 🏃 👹 🛡️
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-retro text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">
                    {t("home.programs.zombie.title")}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-red-800 dark:text-red-400/90">
                    {t("home.programs.zombie.subtitle")}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("home.programs.zombie.desc")}
                  </p>

                  {/* Features list */}
                  <div className="mt-4 grid grid-cols-2 gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-600 dark:text-red-400 font-black">✓</span>
                      <span>4-Lane Defense</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-600 dark:text-red-400 font-black">✓</span>
                      <span>Laser Turret</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-600 dark:text-red-400 font-black">✓</span>
                      <span>Shield Integrity</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-600 dark:text-red-400 font-black">✓</span>
                      <span>Horde Waves</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                  <Link
                    href="/games/zombie"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 py-3 font-retro text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/30 active:scale-98 cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>{t("home.programs.zombie.action")}</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* PROGRAM 4: Mouse Blade Master (Mouse Slicer Arcade) */}
            {visibleProgramIds.has("mouseGame") && (
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-sky-300 bg-gradient-to-b from-sky-50/70 via-white to-white dark:border-sky-500/30 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 p-6 shadow-lg shadow-sky-500/10 dark:shadow-xl dark:shadow-sky-950/20"
              >
                <div className="absolute top-0 right-0 h-40 w-40 bg-sky-400/10 dark:bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-100 text-sky-900 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-300 px-3 py-1 font-retro text-[9px] sm:text-[10px] font-black uppercase tracking-wide">
                      <MousePointer className="h-3.5 w-3.5" />
                      <span>{t("home.programs.mouseGame.tag")}</span>
                    </span>
                    <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-bold">
                      🖱️ 💥 ⚔️ 💣
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-retro text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                    {t("home.programs.mouseGame.title")}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-sky-800 dark:text-sky-400/90">
                    {t("home.programs.mouseGame.subtitle")}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("home.programs.mouseGame.desc")}
                  </p>

                  {/* Features list */}
                  <div className="mt-4 grid grid-cols-2 gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sky-600 dark:text-sky-400 font-black">✓</span>
                      <span>Left-Drag Slicing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sky-600 dark:text-sky-400 font-black">✓</span>
                      <span>360° Shockwave</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sky-600 dark:text-sky-400 font-black">✓</span>
                      <span>Scroll Wheel Blade</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sky-600 dark:text-sky-400 font-black">✓</span>
                      <span>Traps & Gold Fruits</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                  <Link
                    href="/games/using-mouse"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 py-3 font-retro text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:shadow-lg hover:shadow-sky-500/30 active:scale-98 cursor-pointer"
                  >
                    <MousePointer className="h-4 w-4" />
                    <span>{t("home.programs.mouseGame.action")}</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}

          {/* Secondary Studio & Reference Tools Grid */}
          {(visibleProgramIds.has("custom") ||
            visibleProgramIds.has("guide")) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 mt-6">
              {/* PROGRAM 5: Custom Lesson Studio */}
              {visibleProgramIds.has("custom") && (
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-md shadow-sm transition-all hover:border-teal-300 dark:hover:border-teal-500/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-400/30 dark:bg-teal-500/10 dark:text-teal-300 px-3 py-0.5 font-retro text-[9px] font-black uppercase tracking-wide">
                        <BookOpen className="h-3 w-3" />
                        <span>{t("home.programs.custom.tag")}</span>
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black font-retro text-slate-900 dark:text-white">
                      {t("home.programs.custom.title")}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("home.programs.custom.desc")}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setCustomModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50 dark:border-teal-500/40 dark:bg-teal-500/15 py-2.5 font-retro text-xs font-bold text-teal-800 dark:text-teal-200 transition-colors hover:bg-teal-100 dark:hover:bg-teal-500/25 cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>{t("home.programs.custom.action")}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PROGRAM 6: NiDA Keyboard & Guide */}
              {visibleProgramIds.has("guide") && (
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-md shadow-sm transition-all hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300 px-3 py-0.5 font-retro text-[9px] font-black uppercase tracking-wide">
                        <Keyboard className="h-3 w-3" />
                        <span>{t("home.programs.guide.tag")}</span>
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black font-retro text-slate-900 dark:text-white">
                      {t("home.programs.guide.title")}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("home.programs.guide.desc")}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setHelpOpen(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/15 py-2.5 font-retro text-xs font-bold text-blue-800 dark:text-blue-200 transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/25 cursor-pointer"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>{t("home.programs.guide.action")}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </section>

        {/* 5. Footer */}
        <footer className="mt-8 border-t border-slate-200 dark:border-white/10 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span>{t("footer.note")}</span> •{" "}
            <span className="text-slate-700 dark:text-slate-300">{t("app.tagline")}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Offline PWA</span>
            <span>•</span>
            <span>Khmer Unicode NiDA</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <GuideDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <CustomLessonDialog
        open={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onSave={handleSaveCustom}
      />
    </div>
  );
}
