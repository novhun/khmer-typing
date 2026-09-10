"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, RotateCcw, SlidersHorizontal, Home } from "lucide-react";
import { ZombieCanvas } from "./ZombieCanvas";
import { ZombieHud } from "./ZombieHud";
import { ZombieModeModal } from "./ZombieModeModal";
import { ZombieGameOverModal } from "./ZombieGameOverModal";
import { zombieSound } from "./soundEngine";
import { getRandomZombieWord, getZombieSpawnProps } from "./wordData";
import {
  DifficultyLevel,
  FloatingText,
  GameStats,
  GameStatus,
  LanguageMode,
  LaserShot,
  Particle,
  ZombieItem,
} from "./types";

const INITIAL_STATS: GameStats = {
  score: 0,
  wave: 1,
  baseHealth: 100,
  combo: 0,
  maxCombo: 0,
  zombiesEliminated: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  startTime: 0,
};

export const ZombieGame: React.FC = () => {
  // Game lifecycle & settings
  const [status, setStatus] = useState<GameStatus>("menu");
  const [language, setLanguage] = useState<LanguageMode>("km");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [isMuted, setIsMuted] = useState<boolean>(zombieSound.isMuted());
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [currentInput, setCurrentInput] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "easy") setDifficulty(1);
    else if (mode === "survivor") setDifficulty(2);
    else if (mode === "nightmare") setDifficulty(3);

    const lang = params.get("lang");
    if (lang === "en") setLanguage("en");
    else if (lang === "km" || lang === "kh") setLanguage("km");
  }, []);

  // Canvas viewport dimensions
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 600,
  });

  // Invisible input ref for IME & full keyboard capture
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // High-frequency physics items stored in Refs for zero-lag rendering
  const zombiesRef = useRef<ZombieItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lasersRef = useRef<LaserShot[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const screenShakeRef = useRef<number>(0);

  // Spawning & gravity controls
  const lastSpawnTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const [, setFrameTick] = useState<number>(0);

  // Focus hidden input
  const ensureInputFocus = useCallback(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

  // Update canvas dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 1000,
          height: clientHeight || 600,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Synchronize document.documentElement.dataset.lang for typography
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.lang = language;
    }
  }, [language]);

  /* ----------------------------------------------------------------------- *
   * Zombie Spawner Logic
   * ----------------------------------------------------------------------- */
  const spawnZombie = useCallback(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    const laneCount = 4;
    const laneHeight = height / laneCount;
    const lane = Math.floor(Math.random() * laneCount);
    const y = lane * laneHeight + laneHeight / 2;

    const props = getZombieSpawnProps(difficulty, stats.wave);
    const word = getRandomZombieWord(language, difficulty);

    const newZombie: ZombieItem = {
      id: `zombie_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      word,
      typedProgress: "",
      x: width + 40,
      y,
      lane,
      speed: props.speed,
      type: props.type,
      maxHp: props.maxHp,
      hp: props.maxHp,
      radius: props.radius,
      wobble: Math.random() * Math.PI * 2,
      isTargeted: false,
      isEliminated: false,
      eliminatedTime: 0,
    };

    zombiesRef.current.push(newZombie);
  }, [difficulty, dimensions, language, stats.wave]);

  /* ----------------------------------------------------------------------- *
   * Eliminate Zombie & Trigger Plasma Laser Shot
   * ----------------------------------------------------------------------- */
  const eliminateZombie = useCallback((zombie: ZombieItem) => {
    zombie.isEliminated = true;
    zombie.eliminatedTime = Date.now();

    // 1. Plasma Laser Bolt from Base Turret to Zombie
    const turretX = 45;
    const turretY = zombie.y;
    lasersRef.current.push({
      id: `laser_${Date.now()}`,
      startX: turretX,
      startY: turretY,
      targetX: zombie.x,
      targetY: zombie.y,
      life: 14,
      maxLife: 14,
      color: "#38bdf8",
    });

    // 2. Particle Burst
    const particleCount = zombie.type === "brute" ? 30 : 20;
    const pColor =
      zombie.type === "runner"
        ? "#f97316"
        : zombie.type === "brute"
        ? "#a855f7"
        : "#22c55e";

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        x: zombie.x,
        y: zombie.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 4,
        color: Math.random() > 0.3 ? pColor : "#e2e8f0",
        alpha: 1,
        decay: 0.03 + Math.random() * 0.03,
      });
    }

    // 3. Audio synthesis
    zombieSound.playLaser();
    zombieSound.playZombieExplode();

    // 4. Update Stats & Combo
    setStats((prev) => {
      const nextCombo = prev.combo + 1;
      const multiplier = Math.min(nextCombo, 10);
      const points = 100 * difficulty * multiplier;

      zombieSound.playCombo(nextCombo);

      // Floating Score
      floatingTextsRef.current.push({
        id: `ft_${Date.now()}`,
        text: nextCombo >= 2 ? `+${points} (x${multiplier})` : `+${points}`,
        x: zombie.x,
        y: zombie.y - 20,
        vy: -1.8,
        alpha: 1,
        scale: nextCombo >= 3 ? 1.3 : 1,
        color: nextCombo >= 3 ? "#facc15" : "#34d399",
      });

      const newKilled = prev.zombiesEliminated + 1;
      // Advance wave every 10 zombies killed
      const newWave = 1 + Math.floor(newKilled / 10);
      if (newWave > prev.wave) {
        zombieSound.playWaveStart();
        floatingTextsRef.current.push({
          id: `wave_up_${Date.now()}`,
          text: `🚨 WAVE ${newWave} CLEARED!`,
          x: dimensions.width / 2,
          y: dimensions.height / 2 - 40,
          vy: -1,
          alpha: 1,
          scale: 1.6,
          color: "#f43f5e",
        });
      }

      return {
        ...prev,
        score: prev.score + points,
        combo: nextCombo,
        maxCombo: Math.max(prev.maxCombo, nextCombo),
        zombiesEliminated: newKilled,
        wave: newWave,
        correctKeystrokes: prev.correctKeystrokes + zombie.word.length,
        // Small base repair on wave advance
        baseHealth: newWave > prev.wave ? Math.min(prev.baseHealth + 10, 100) : prev.baseHealth,
      };
    });
  }, [difficulty, dimensions.height, dimensions.width]);

  /* ----------------------------------------------------------------------- *
   * Real-time Typing Matcher
   * ----------------------------------------------------------------------- */
  const handleTypedString = useCallback((typed: string) => {
    if (status !== "playing") return;

    setStats((prev) => ({
      ...prev,
      totalKeystrokes: prev.totalKeystrokes + 1,
    }));

    const activeZombies = zombiesRef.current.filter((z) => !z.isEliminated);
    if (activeZombies.length === 0) return;

    // Normalization for English mode
    const normalize = (s: string) =>
      language === "en" ? s.trim().toUpperCase() : s;
    const normalizedTyped = normalize(typed);

    // Prioritize zombie already targeted, or sort by distance to base (closest X first)
    const sorted = [...activeZombies].sort((a, b) => {
      if (a.isTargeted && !b.isTargeted) return -1;
      if (!a.isTargeted && b.isTargeted) return 1;
      return a.x - b.x;
    });

    // 1. Check for full exact match
    const exactMatch = sorted.find((z) => normalize(z.word) === normalizedTyped);
    if (exactMatch) {
      eliminateZombie(exactMatch);
      setCurrentInput("");
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      // Untarget others
      sorted.forEach((z) => {
        z.isTargeted = false;
        z.typedProgress = "";
      });
      return;
    }

    // 2. Check for prefix match
    let foundPrefix = false;
    for (const z of sorted) {
      const normWord = normalize(z.word);
      if (normWord.startsWith(normalizedTyped)) {
        z.isTargeted = true;
        z.typedProgress = z.word.slice(0, normalizedTyped.length);
        foundPrefix = true;
        // Keep focus on this target
        break;
      }
    }

    if (foundPrefix) {
      setCurrentInput(typed);
    } else {
      // If typing doesn't match any prefix, reset
      setCurrentInput("");
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      sorted.forEach((z) => {
        z.isTargeted = false;
        z.typedProgress = "";
      });
    }
  }, [eliminateZombie, language, status]);

  /* ----------------------------------------------------------------------- *
   * Main 60 FPS Game Physics Loop
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (status !== "playing") {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    let lastTime = performance.now();
    const baseWallX = 110;

    // Spawning interval adjusts by difficulty
    const spawnInterval =
      difficulty === 1 ? 2400 : difficulty === 2 ? 1700 : 1200;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.66, 2.5);
      lastTime = now;

      // 1. Spawn Wave Check
      if (now - lastSpawnTimeRef.current > spawnInterval) {
        spawnZombie();
        lastSpawnTimeRef.current = now;
      }

      // 2. Update Zombies & Detect Base Breach
      const currentZombies = zombiesRef.current;
      for (let i = currentZombies.length - 1; i >= 0; i--) {
        const z = currentZombies[i];

        if (!z.isEliminated) {
          z.x -= z.speed * dt;
          z.wobble += 0.08 * dt;

          // Check if zombie breached the base wall
          if (z.x <= baseWallX) {
            z.isEliminated = true;

            // Base Damage based on zombie type
            const damage = z.type === "brute" ? 30 : z.type === "runner" ? 20 : 15;
            zombieSound.playBaseHit();
            screenShakeRef.current = 1.2;

            setStats((prev) => {
              const newHp = Math.max(prev.baseHealth - damage, 0);
              if (newHp <= 0) {
                zombieSound.playGameOver();
                setTimeout(() => setStatus("gameover"), 200);
              }
              return {
                ...prev,
                baseHealth: newHp,
                combo: 0, // Reset combo on damage
              };
            });
          }
        }
      }

      // Clean up eliminated zombies after brief delay
      zombiesRef.current = currentZombies.filter(
        (z) => !z.isEliminated || Date.now() - z.eliminatedTime < 200
      );

      // 3. Update Lasers
      const lasers = lasersRef.current;
      for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].life -= dt;
        if (lasers[i].life <= 0) lasers.splice(i, 1);
      }

      // 4. Update Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= p.decay * dt;
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      // 5. Update Floating Texts
      const fts = floatingTextsRef.current;
      for (let i = fts.length - 1; i >= 0; i--) {
        const ft = fts[i];
        ft.y += ft.vy * dt;
        ft.alpha -= 0.025 * dt;
        if (ft.alpha <= 0) fts.splice(i, 1);
      }

      // 6. Decay Screen Shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current = Math.max(screenShakeRef.current - 0.05 * dt, 0);
      }

      setFrameTick(now);
      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [difficulty, spawnZombie, status]);

  /* ----------------------------------------------------------------------- *
   * Global Keyboard Handling
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (status === "playing") setStatus("paused");
        else if (status === "paused") setStatus("playing");
        return;
      }

      if (status !== "playing") return;

      ensureInputFocus();

      if (e.key === "Backspace") {
        e.preventDefault();
        setCurrentInput((prev) => {
          const updated = prev.slice(0, -1);
          handleTypedString(updated);
          return updated;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ensureInputFocus, handleTypedString, status]);

  /* ----------------------------------------------------------------------- *
   * Action Handlers
   * ----------------------------------------------------------------------- */
  const startGame = () => {
    zombiesRef.current = [];
    particlesRef.current = [];
    lasersRef.current = [];
    floatingTextsRef.current = [];
    setCurrentInput("");
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";

    setStats({
      ...INITIAL_STATS,
      startTime: Date.now(),
    });

    setStatus("playing");
    lastSpawnTimeRef.current = performance.now();
    zombieSound.playWaveStart();
    setTimeout(ensureInputFocus, 50);
  };

  const togglePause = () => {
    if (status === "playing") setStatus("paused");
    else if (status === "paused") {
      setStatus("playing");
      setTimeout(ensureInputFocus, 50);
    }
  };

  const toggleMute = () => {
    const muted = zombieSound.toggleMute();
    setIsMuted(muted);
  };

  const restartGame = () => {
    startGame();
  };

  const openMenu = () => {
    setStatus("menu");
  };

  // Find active locked-on zombie
  const targetedZombie = zombiesRef.current.find(
    (z) => z.isTargeted && !z.isEliminated
  );

  return (
    <div
      ref={containerRef}
      onClick={ensureInputFocus}
      className="relative h-screen w-full overflow-hidden bg-slate-950 font-khmer select-none"
    >
      {/* Hidden input capturing full IME & standard keyboard input */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={currentInput}
        onChange={(e) => {
          const val = e.target.value;
          handleTypedString(val);
        }}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="absolute -top-96 left-0 opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* HTML5 Canvas Defense Arena */}
      <ZombieCanvas
        zombies={zombiesRef.current}
        particles={particlesRef.current}
        lasers={lasersRef.current}
        floatingTexts={floatingTextsRef.current}
        baseHealth={stats.baseHealth}
        screenShake={screenShakeRef.current}
        canvasWidth={dimensions.width}
        canvasHeight={dimensions.height}
      />

      {/* Arcade Top HUD */}
      {status !== "menu" && (
        <ZombieHud
          stats={stats}
          language={language}
          difficulty={difficulty}
          isPaused={status === "paused"}
          isMuted={isMuted}
          currentInput={currentInput}
          targetedZombie={targetedZombie}
          onTogglePause={togglePause}
          onToggleMute={toggleMute}
          onRestart={restartGame}
          onOpenMenu={openMenu}
        />
      )}

      {/* Pause Overlay */}
      {status === "paused" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md text-white p-4 font-khmer">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-7 text-center shadow-2xl shadow-red-950/40">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 font-retro text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
              <span>{language === "km" ? "ផ្អាកការប្រយុទ្ធ" : "TACTICAL PAUSE"}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-retro tracking-tight text-white mb-2">
              {language === "km" ? "សម្រាកមួយភ្លែត!" : "Defense Suspended"}
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {language === "km"
                ? "ចុចប៊ូតុងខាងក្រោម ឬចុច 'Esc' លើក្ដារចុចដើម្បីបន្តការពារ"
                : "Press Escape or Resume to continue defending"}
            </p>

            <div className="flex flex-col gap-2.5">
              {/* Resume */}
              <button
                type="button"
                onClick={togglePause}
                className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 px-4 py-3.5 font-retro text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="h-4 w-4 fill-current" />
                  <span>{language === "km" ? "បន្តការពារ" : "Resume Defense"}</span>
                </div>
                <span className="rounded-md bg-black/20 px-2 py-0.5 text-[9px] font-retro font-bold tracking-wider">
                  ESC
                </span>
              </button>

              {/* Restart */}
              <button
                type="button"
                onClick={restartGame}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-3 font-retro text-[11px] sm:text-xs font-bold text-slate-200 hover:border-orange-400/40 hover:bg-white/15 hover:text-white active:scale-98 transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-orange-300" />
                <span>{language === "km" ? "ការពារឡើងវិញ" : "Restart Battle"}</span>
              </button>

              {/* Change Mode */}
              <button
                type="button"
                onClick={openMenu}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-retro text-[11px] sm:text-xs font-bold text-slate-300 hover:border-emerald-400/40 hover:bg-white/10 hover:text-white active:scale-98 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                <span>{language === "km" ? "ប្តូរកម្រិត / ភាសា" : "Change Threat Level"}</span>
              </button>

              {/* Return to Home */}
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 py-2.5 font-retro text-[10px] sm:text-xs font-semibold text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-slate-400" />
                <span>{language === "km" ? "ត្រឡប់ទៅទំព័រដើម" : "Quit to Home Hub"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Startup Mode Selection Modal */}
      <ZombieModeModal
        isOpen={status === "menu"}
        selectedLanguage={language}
        selectedDifficulty={difficulty}
        onSelectLanguage={setLanguage}
        onSelectDifficulty={setDifficulty}
        onStartGame={startGame}
      />

      {/* Game Over Modal */}
      <ZombieGameOverModal
        isOpen={status === "gameover"}
        stats={stats}
        language={language}
        onRestart={restartGame}
        onOpenMenu={openMenu}
      />
    </div>
  );
};
