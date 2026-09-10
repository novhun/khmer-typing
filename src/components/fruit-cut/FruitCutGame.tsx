"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, RotateCcw, SlidersHorizontal, Home } from "lucide-react";
import { FruitCanvas } from "./FruitCanvas";
import { FruitCutHud } from "./FruitCutHud";
import { ModeSelectModal } from "./ModeSelectModal";
import { GameOverModal } from "./GameOverModal";
import { fruitSound } from "./soundEngine";
import { getRandomFruit, getRandomWord } from "./wordData";
import {
  DifficultyLevel,
  FloatingText,
  FruitItem,
  GameStats,
  GameStatus,
  LanguageMode,
  Particle,
  SlashEffect,
} from "./types";

const INITIAL_STATS: GameStats = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  lives: 3,
  maxLives: 3,
  slicedCount: 0,
  missedCount: 0,
  totalTypedKeystrokes: 0,
  correctTypedKeystrokes: 0,
  startTime: 0,
  endTime: 0,
};

export const FruitCutGame: React.FC = () => {
  // Game lifecycle & settings state
  const [status, setStatus] = useState<GameStatus>("menu");
  const [language, setLanguage] = useState<LanguageMode>("km");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [isMuted, setIsMuted] = useState<boolean>(fruitSound.isMuted());
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [currentInput, setCurrentInput] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "casual") setDifficulty(1);
    else if (mode === "arcade") setDifficulty(2);
    else if (mode === "master") setDifficulty(3);

    const lang = params.get("lang");
    if (lang === "en") setLanguage("en");
    else if (lang === "km" || lang === "kh") setLanguage("km");
  }, []);

  // Canvas viewport dimensions
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 600,
  });

  // Invisible input ref for IME & full keyboard capture
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // High-frequency physics items stored in Refs for zero-lag rendering
  const fruitsRef = useRef<FruitItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const slashesRef = useRef<SlashEffect[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // State mirror for canvas rendering triggers
  const [, setFrameTick] = useState<number>(0);

  // Spawning & gravity controls
  const lastSpawnTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Focus the hidden input whenever playing
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
          width: clientWidth || 900,
          height: clientHeight || 600,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.lang = language === "km" ? "kh" : "en";
    }
  }, [language]);

  /* ----------------------------------------------------------------------- *
   * Fruit Spawner Logic
   * ----------------------------------------------------------------------- */
  const spawnFruitWave = useCallback(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    // How many fruits spawn at once based on difficulty
    const waveCount =
      difficulty === 1
        ? 1
        : difficulty === 2
        ? Math.random() < 0.65 ? 1 : 2
        : Math.random() < 0.4 ? 1 : Math.random() < 0.75 ? 2 : 3;

    for (let i = 0; i < waveCount; i++) {
      const fruitCfg = getRandomFruit();
      const word = getRandomWord(language, difficulty);

      // Randomize spawn X along the bottom
      const margin = 100;
      const x = margin + Math.random() * (width - margin * 2);
      const y = height + 30;

      // Upward velocity calculated to reach upper 25%-35% of the screen
      const gravity = 0.28;
      const peakY = height * (0.22 + Math.random() * 0.18);
      const distY = y - peakY;
      const vy = -Math.sqrt(2 * gravity * distY);

      // Horizontal velocity slightly angling toward center
      const targetCenterX = width / 2 + (Math.random() - 0.5) * 200;
      const timeToPeak = -vy / gravity;
      const vx = (targetCenterX - x) / (timeToPeak * (1.8 + Math.random() * 0.4));

      const newFruit: FruitItem = {
        id: `fruit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        word,
        typedProgress: "",
        x,
        y,
        vx,
        vy,
        radius: fruitCfg.radius,
        rotation: (Math.random() - 0.5) * 0.5,
        vRot: (Math.random() - 0.5) * 0.04,
        kind: fruitCfg.kind,
        color: fruitCfg.color,
        innerColor: fruitCfg.innerColor,
        emoji: fruitCfg.emoji,
        sliced: false,
        sliceAngle: 0,
        sliceTime: 0,
        missed: false,
        markedForRemoval: false,
      };

      fruitsRef.current.push(newFruit);
    }
  }, [difficulty, dimensions, language]);

  /* ----------------------------------------------------------------------- *
   * Fruit Slicing Action Trigger
   * ----------------------------------------------------------------------- */
  const sliceFruit = useCallback((fruit: FruitItem) => {
    fruit.sliced = true;
    fruit.sliceTime = Date.now();

    // Random diagonal slash angle (-35 to -55 degrees)
    const angle = ((-45 + (Math.random() - 0.5) * 25) * Math.PI) / 180;
    fruit.sliceAngle = angle;

    // Normal vector perpendicular to slash cut
    const normalX = Math.cos(angle + Math.PI / 2);
    const normalY = Math.sin(angle + Math.PI / 2);
    const pushSpeed = 3.5;

    fruit.half1 = {
      x: fruit.x - normalX * 8,
      y: fruit.y - normalY * 8,
      vx: fruit.vx - normalX * pushSpeed,
      vy: fruit.vy - normalY * pushSpeed - 1.5,
      rot: fruit.rotation,
      vRot: fruit.vRot - 0.05,
    };

    fruit.half2 = {
      x: fruit.x + normalX * 8,
      y: fruit.y + normalY * 8,
      vx: fruit.vx + normalX * pushSpeed,
      vy: fruit.vy + normalY * pushSpeed - 1.5,
      rot: fruit.rotation,
      vRot: fruit.vRot + 0.05,
    };

    // 1. Blade Slash Visual Trail
    const slashLength = fruit.radius * 2.8;
    slashesRef.current.push({
      id: `slash_${Date.now()}`,
      startX: fruit.x - Math.cos(angle) * slashLength,
      startY: fruit.y - Math.sin(angle) * slashLength,
      endX: fruit.x + Math.cos(angle) * slashLength,
      endY: fruit.y + Math.sin(angle) * slashLength,
      progress: 0,
      life: 16,
      color: "#38bdf8",
    });

    // 2. Juice Particles Burst
    const particleCount = 28;
    for (let p = 0; p < particleCount; p++) {
      const pAngle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        x: fruit.x,
        y: fruit.y,
        vx: Math.cos(pAngle) * speed + fruit.vx * 0.4,
        vy: Math.sin(pAngle) * speed + fruit.vy * 0.4,
        size: 2.5 + Math.random() * 4,
        color: Math.random() > 0.4 ? fruit.color : fruit.innerColor,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        gravity: 0.2,
      });
    }

    // 3. Sound Synthesis
    fruitSound.playWhoosh();
    fruitSound.playSplat();

    // 4. Score & Combo Multiplier
    setStats((prev) => {
      const nextCombo = prev.combo + 1;
      const multiplier = Math.min(nextCombo, 10);
      const points = 100 * difficulty * multiplier;

      fruitSound.playCombo(nextCombo);

      // Floating Score text
      floatingTextsRef.current.push({
        id: `ft_${Date.now()}`,
        text: nextCombo >= 2 ? `+${points} (x${multiplier})` : `+${points}`,
        x: fruit.x,
        y: fruit.y - 20,
        vy: -2,
        alpha: 1,
        scale: nextCombo >= 3 ? 1.3 : 1,
        color: nextCombo >= 3 ? "#facc15" : "#34d399",
      });

      return {
        ...prev,
        score: prev.score + points,
        combo: nextCombo,
        maxCombo: Math.max(prev.maxCombo, nextCombo),
        slicedCount: prev.slicedCount + 1,
        correctTypedKeystrokes: prev.correctTypedKeystrokes + fruit.word.length,
      };
    });
  }, [difficulty]);

  /* ----------------------------------------------------------------------- *
   * Typing Listener Logic (IME, Keystrokes & Subscripts)
   * ----------------------------------------------------------------------- */
  const handleTypedString = useCallback((typed: string) => {
    if (status !== "playing") return;

    setStats((prev) => ({
      ...prev,
      totalTypedKeystrokes: prev.totalTypedKeystrokes + 1,
    }));

    // Find if any active un-sliced fruit matches the string
    const activeFruits = fruitsRef.current.filter((f) => !f.sliced && !f.missed);

    // Case normalization for English
    const normalize = (s: string) =>
      language === "en" ? s.trim().toUpperCase() : s;

    const normalizedTyped = normalize(typed);

    // Check for exact complete match first
    const matchedFruit = activeFruits.find(
      (f) => normalize(f.word) === normalizedTyped
    );

    if (matchedFruit) {
      sliceFruit(matchedFruit);
      setCurrentInput("");
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      return;
    }

    // Check for prefix match
    let foundPrefix = false;
    for (const f of activeFruits) {
      const normWord = normalize(f.word);
      if (normWord.startsWith(normalizedTyped)) {
        f.typedProgress = f.word.slice(0, normalizedTyped.length);
        foundPrefix = true;
      } else {
        f.typedProgress = "";
      }
    }

    if (foundPrefix) {
      setCurrentInput(typed);
    } else {
      // If current typed doesn't match any prefix, reset
      setCurrentInput("");
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      for (const f of activeFruits) {
        f.typedProgress = "";
      }
    }
  }, [language, sliceFruit, status]);

  /* ----------------------------------------------------------------------- *
   * Main Game Physics Loop (60 FPS requestAnimationFrame)
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (status !== "playing") {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    let lastTime = performance.now();
    const gravity = 0.32;

    const spawnInterval =
      difficulty === 1 ? 2200 : difficulty === 2 ? 1700 : 1300;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.66, 2.5);
      lastTime = now;

      // 1. Spawner
      if (now - lastSpawnTimeRef.current > spawnInterval) {
        spawnFruitWave();
        lastSpawnTimeRef.current = now;
      }

      // 2. Update Fruits
      const currentFruits = fruitsRef.current;
      for (let i = currentFruits.length - 1; i >= 0; i--) {
        const f = currentFruits[i];

        if (f.sliced) {
          // Halves physics
          if (f.half1 && f.half2) {
            f.half1.vy += gravity * dt;
            f.half1.x += f.half1.vx * dt;
            f.half1.y += f.half1.vy * dt;
            f.half1.rot += f.half1.vRot * dt;

            f.half2.vy += gravity * dt;
            f.half2.x += f.half2.vx * dt;
            f.half2.y += f.half2.vy * dt;
            f.half2.rot += f.half2.vRot * dt;

            if (f.half1.y > dimensions.height + 150 && f.half2.y > dimensions.height + 150) {
              f.markedForRemoval = true;
            }
          }
        } else {
          // Un-sliced fruit physics
          f.vy += gravity * dt;
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.rotation += f.vRot * dt;

          // Miss condition: falling past bottom of screen
          if (f.y > dimensions.height + 70 && f.vy > 0 && !f.missed) {
            f.missed = true;
            f.markedForRemoval = true;

            // Miss penalty: lose 1 life, reset combo
            fruitSound.playMiss();
            setStats((prev) => {
              const newLives = prev.lives - 1;
              if (newLives <= 0) {
                // Game Over!
                fruitSound.playGameOver();
                setTimeout(() => setStatus("gameover"), 200);
              }
              return {
                ...prev,
                lives: Math.max(newLives, 0),
                combo: 0,
                missedCount: prev.missedCount + 1,
              };
            });
          }
        }
      }

      // Clean up marked fruits
      fruitsRef.current = currentFruits.filter((f) => !f.markedForRemoval);

      // 3. Update Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= p.decay * dt;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // 4. Update Slashes
      const slashes = slashesRef.current;
      for (let i = slashes.length - 1; i >= 0; i--) {
        const s = slashes[i];
        s.life -= dt;
        if (s.life <= 0) {
          slashes.splice(i, 1);
        }
      }

      // 5. Update Floating Texts
      const fts = floatingTextsRef.current;
      for (let i = fts.length - 1; i >= 0; i--) {
        const ft = fts[i];
        ft.y += ft.vy * dt;
        ft.alpha -= 0.025 * dt;
        if (ft.alpha <= 0) {
          fts.splice(i, 1);
        }
      }

      // Trigger re-render of canvas frame
      setFrameTick(now);
      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [difficulty, dimensions.height, spawnFruitWave, status]);

  /* ----------------------------------------------------------------------- *
   * Global Keyboard Handling (Escape to pause, direct keys)
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (status === "playing") setStatus("paused");
        else if (status === "paused") setStatus("playing");
        return;
      }

      if (status !== "playing") return;

      // Keep hidden input focused
      ensureInputFocus();

      // Handle Backspace
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
   * Game Controls Actions
   * ----------------------------------------------------------------------- */
  const startGame = () => {
    fruitsRef.current = [];
    particlesRef.current = [];
    slashesRef.current = [];
    floatingTextsRef.current = [];
    setCurrentInput("");
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";

    setStats({
      ...INITIAL_STATS,
      startTime: Date.now(),
    });

    setStatus("playing");
    lastSpawnTimeRef.current = performance.now();
    fruitSound.playStart();
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
    const muted = fruitSound.toggleMute();
    setIsMuted(muted);
  };

  const restartGame = () => {
    startGame();
  };

  const openMenu = () => {
    setStatus("menu");
  };

  return (
    <div
      ref={containerRef}
      onClick={ensureInputFocus}
      className="relative h-screen w-full overflow-hidden bg-slate-950 font-khmer select-none"
    >
      {/* Hidden input element capturing full IME & standard keyboard input */}
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

      {/* HTML5 Canvas Game Renderer */}
      <FruitCanvas
        fruits={fruitsRef.current}
        particles={particlesRef.current}
        slashEffects={slashesRef.current}
        floatingTexts={floatingTextsRef.current}
        canvasWidth={dimensions.width}
        canvasHeight={dimensions.height}
      />

      {/* Arcade Top HUD */}
      {status !== "menu" && (
        <FruitCutHud
          stats={stats}
          language={language}
          difficulty={difficulty}
          isPaused={status === "paused"}
          isMuted={isMuted}
          currentInput={currentInput}
          onTogglePause={togglePause}
          onToggleMute={toggleMute}
          onRestart={restartGame}
          onOpenMenu={openMenu}
        />
      )}

      {/* Pause Overlay */}
      {status === "paused" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md text-white p-4 font-khmer">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-7 text-center shadow-2xl shadow-amber-950/40">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 font-retro text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
              <span>{language === "km" ? "ផ្អាកការលេង" : "GAME PAUSED"}</span>
            </div>

            <h2 className="font-retro text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
              {language === "km" ? "សម្រាកមួយភ្លែត!" : "Take a Breather"}
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {language === "km"
                ? "ចុចប៊ូតុងខាងក្រោម ឬចុច 'Esc' លើក្ដារចុចដើម្បីបន្ត"
                : "Press Escape or Resume to continue slicing"}
            </p>

            <div className="flex flex-col gap-2.5 font-retro text-xs sm:text-sm">
              {/* Resume button */}
              <button
                type="button"
                onClick={togglePause}
                className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 px-4 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="h-4 w-4 fill-current" />
                  <span>{language === "km" ? "បន្តការលេង" : "Resume"}</span>
                </div>
                <span className="rounded-md bg-black/20 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider">
                  ESC
                </span>
              </button>

              {/* Restart button */}
              <button
                type="button"
                onClick={restartGame}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-3 font-bold text-slate-200 hover:border-orange-400/40 hover:bg-white/15 hover:text-white active:scale-98 transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-orange-300" />
                <span>{language === "km" ? "លេងម្ដងទៀត (Restart)" : "Restart Round"}</span>
              </button>

              {/* Change Mode button */}
              <button
                type="button"
                onClick={openMenu}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold text-slate-300 hover:border-emerald-400/40 hover:bg-white/10 hover:text-white active:scale-98 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                <span>{language === "km" ? "ប្តូរកម្រិត / ភាសា" : "Change Mode"}</span>
              </button>

              {/* Return to Home link */}
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 py-2.5 font-semibold text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-slate-400" />
                <span>{language === "km" ? "ត្រឡប់ទៅទំព័រដើម" : "Quit to Home"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Startup Bilingual & Difficulty Mode Modal */}
      <ModeSelectModal
        isOpen={status === "menu"}
        selectedLanguage={language}
        selectedDifficulty={difficulty}
        onSelectLanguage={setLanguage}
        onSelectDifficulty={setDifficulty}
        onStartGame={startGame}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={status === "gameover"}
        stats={stats}
        language={language}
        onRestart={restartGame}
        onOpenMenu={openMenu}
      />
    </div>
  );
};
