export type RankTier = "S+" | "S" | "A" | "B" | "C";

export interface RankInfo {
  tier: RankTier;
  nameKey: string; // "home.rank.sPlus", etc.
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeGlow: string;
  progressPercent: number;
  nextTier: RankTier | null;
  targetCleared: number;
  targetWpm: number;
}

export function getPlayerRank(clearedCount: number, bestWpm: number): RankInfo {
  if (clearedCount >= 15 && bestWpm >= 60) {
    return {
      tier: "S+",
      nameKey: "home.rank.sPlus",
      colorClass: "text-amber-400 dark:text-amber-300",
      bgClass: "bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20",
      borderClass: "border-amber-400 shadow-amber-500/30",
      badgeGlow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
      progressPercent: 100,
      nextTier: null,
      targetCleared: 15,
      targetWpm: 60,
    };
  }

  if (clearedCount >= 10 && bestWpm >= 45) {
    // Progress towards S+ (needs 15 cleared & 60 WPM)
    const clearedProg = Math.min(1, (clearedCount - 10) / (15 - 10));
    const wpmProg = Math.min(1, (bestWpm - 45) / (60 - 45));
    const progressPercent = Math.round(((clearedProg + wpmProg) / 2) * 100);

    return {
      tier: "S",
      nameKey: "home.rank.s",
      colorClass: "text-purple-500 dark:text-purple-300",
      bgClass: "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20",
      borderClass: "border-purple-400 shadow-purple-500/30",
      badgeGlow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]",
      progressPercent: Math.max(10, Math.min(95, progressPercent)),
      nextTier: "S+",
      targetCleared: 15,
      targetWpm: 60,
    };
  }

  if (clearedCount >= 6 && bestWpm >= 30) {
    // Progress towards S (needs 10 cleared & 45 WPM)
    const clearedProg = Math.min(1, (clearedCount - 6) / (10 - 6));
    const wpmProg = Math.min(1, (bestWpm - 30) / (45 - 30));
    const progressPercent = Math.round(((clearedProg + wpmProg) / 2) * 100);

    return {
      tier: "A",
      nameKey: "home.rank.a",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20",
      borderClass: "border-emerald-400 shadow-emerald-500/30",
      badgeGlow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]",
      progressPercent: Math.max(10, Math.min(95, progressPercent)),
      nextTier: "S",
      targetCleared: 10,
      targetWpm: 45,
    };
  }

  if (clearedCount >= 3 && bestWpm >= 18) {
    // Progress towards A (needs 6 cleared & 30 WPM)
    const clearedProg = Math.min(1, (clearedCount - 3) / (6 - 3));
    const wpmProg = Math.min(1, (bestWpm - 18) / (30 - 18));
    const progressPercent = Math.round(((clearedProg + wpmProg) / 2) * 100);

    return {
      tier: "B",
      nameKey: "home.rank.b",
      colorClass: "text-sky-600 dark:text-sky-400",
      bgClass: "bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-sky-500/20",
      borderClass: "border-sky-400 shadow-sky-500/30",
      badgeGlow: "shadow-[0_0_15px_rgba(14,165,233,0.4)]",
      progressPercent: Math.max(10, Math.min(95, progressPercent)),
      nextTier: "A",
      targetCleared: 6,
      targetWpm: 30,
    };
  }

  // Tier C (Apprentice / Novice)
  // Progress towards B (needs 3 cleared & 18 WPM)
  const clearedProg = Math.min(1, clearedCount / 3);
  const wpmProg = Math.min(1, bestWpm / 18);
  const progressPercent = Math.round(((clearedProg + wpmProg) / 2) * 100);

  return {
    tier: "C",
    nameKey: "home.rank.c",
    colorClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-gradient-to-r from-slate-200/50 via-slate-100/50 to-slate-200/50 dark:from-slate-800/40 dark:via-slate-800/60 dark:to-slate-800/40",
    borderClass: "border-slate-300 dark:border-slate-700",
    badgeGlow: "shadow-sm",
    progressPercent: Math.max(5, Math.min(95, progressPercent)),
    nextTier: "B",
    targetCleared: 3,
    targetWpm: 18,
  };
}
