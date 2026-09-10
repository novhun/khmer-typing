"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BladeTrailPoint,
  DifficultyLevel,
  FloatingText,
  GameStats,
  GameStatus,
  LanguageMode,
  MouseTargetItem,
  Particle,
  Shockwave,
} from "./types";
import {
  getRandomFruitConfig,
  getRandomTargetWord,
  getSpawnKind,
} from "./wordData";
import { mouseGameSound } from "./soundEngine";
import { MouseGameCanvas, renderMouseGameCanvas } from "./MouseGameCanvas";
import { MouseGameHud } from "./MouseGameHud";
import { MouseGameModal } from "./MouseGameModal";
import { MouseGameOverModal } from "./MouseGameOverModal";

const HIGH_SCORE_KEY = "mg:highscore";

export const MouseGame: React.FC = () => {
  // Game Setup & Status
  const [status, setStatus] = useState<GameStatus>("menu");
  const [language, setLanguage] = useState<LanguageMode>("km");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "practice") setDifficulty(1);
    else if (mode === "arcade") setDifficulty(2);
    else if (mode === "blitz") setDifficulty(3);

    const lang = params.get("lang");
    if (lang === "en") setLanguage("en");
    else if (lang === "km" || lang === "kh") setLanguage("km");
  }, []);

  // Core Dynamic Gameplay State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const maxLives = 3;
  const [combo, setCombo] = useState(0);
  const [shockwaveEnergy, setShockwaveEnergy] = useState(0); // 0 - 100%
  const [bladeSize, setBladeSize] = useState(40); // 24 to 76 px

  // Canvas viewport dimensions
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 700 });

  // Game Object Refs (for 60 FPS requestAnimationFrame loop)
  const targetsRef = useRef<MouseTargetItem[]>([]);
  const bladeTrailRef = useRef<BladeTrailPoint[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Mouse cursor tracking
  const cursorPosRef = useRef({
    x: -100,
    y: -100,
    isDown: false,
    vx: 0,
    vy: 0,
    lastTime: 0,
  });

  // Combo timer & Spawner timers
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const whooshThrottleRef = useRef<number>(0);

  // Stats tracker for game over
  const statsRef = useRef<GameStats>({
    score: 0,
    lives: 3,
    maxLives: 3,
    combo: 0,
    maxCombo: 0,
    fruitsSliced: 0,
    bombsDetonated: 0,
    goldenFruitsSliced: 0,
    shockwavesFired: 0,
    shockwaveEnergy: 0,
    bladeSize: 40,
    startTime: 0,
  });

  // Load High Score and Mute state on mount
  useEffect(() => {
    try {
      const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
      if (savedScore) {
        setHighScore(parseInt(savedScore, 10) || 0);
      }
      setIsMuted(mouseGameSound.isMuted());
    } catch {}
  }, []);

  // Synchronize document.documentElement.dataset.lang for typography
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.lang = language;
    }
  }, [language]);

  // Update canvas size on window resize
  const updateSize = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCanvasSize({
      width: Math.max(rect.width, 320),
      height: Math.max(rect.height, 480),
    });
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  // Render a single frame to the canvas
  const drawFrame = useCallback(() => {
    if (!canvasRef.current) return;
    renderMouseGameCanvas(canvasRef.current, {
      targets: targetsRef.current,
      bladeTrail: bladeTrailRef.current,
      shockwaves: shockwavesRef.current,
      particles: particlesRef.current,
      floatingTexts: floatingTextsRef.current,
      cursorPos: cursorPosRef.current,
      bladeSize: statsRef.current.bladeSize,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
      shockwaveReady: statsRef.current.shockwaveEnergy >= 100,
    });
  }, [canvasSize]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame, status]);

  // Audio mute toggle
  const handleToggleMute = useCallback(() => {
    const muted = mouseGameSound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Spawn a target item (Fruit, Bomb, or Golden Fruit)
  const spawnTarget = useCallback(
    (w: number, h: number) => {
      const kind = getSpawnKind(difficulty);
      const fruitCfg = getRandomFruitConfig();
      const word =
        kind === "bomb"
          ? language === "km"
            ? "គ្រាប់បែក"
            : "BOMB"
          : kind === "golden"
          ? language === "km"
            ? "នាគមាស"
            : "GOLDEN"
          : getRandomTargetWord(language, difficulty);

      // Arc launch physics
      const spawnX = Math.random() * (w * 0.7) + w * 0.15;
      const spawnY = h + 40;

      // Speed multipliers based on difficulty
      const speedFactor =
        difficulty === 1 ? 0.85 : difficulty === 2 ? 1.1 : 1.35;

      const targetX = w / 2 + (Math.random() - 0.5) * (w * 0.5);
      const vx = ((targetX - spawnX) / 50) * speedFactor;
      const vy = -(Math.random() * 3.5 + 13) * speedFactor;

      const newItem: MouseTargetItem = {
        id: `target-${Date.now()}-${Math.random()}`,
        word,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        radius: kind === "bomb" ? 34 : kind === "golden" ? 44 : fruitCfg.radius,
        kind,
        color: kind === "golden" ? "#f59e0b" : fruitCfg.color,
        innerColor: kind === "golden" ? "#fef08a" : fruitCfg.innerColor,
        emoji: kind === "bomb" ? "💣" : kind === "golden" ? "🌟" : fruitCfg.emoji,
        sliced: false,
        sliceAngle: 0,
        sliceTime: 0,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.08,
      };

      targetsRef.current.push(newItem);
    },
    [difficulty, language]
  );

  // Trigger 360° Shockwave pulse (Right Click ability)
  const triggerShockwave = useCallback(
    (blastX: number, blastY: number) => {
      // Must have at least 100% energy
      if (shockwaveEnergy < 100) return;

      mouseGameSound.playShockwave();
      setShockwaveEnergy(0);
      statsRef.current.shockwavesFired += 1;

      // Create visual expanding shockwave
      const newSw: Shockwave = {
        id: `sw-${Date.now()}`,
        x: blastX,
        y: blastY,
        radius: 10,
        maxRadius: 420,
        alpha: 1,
      };
      shockwavesRef.current.push(newSw);

      // Add floating text
      floatingTextsRef.current.push({
        id: `ft-sw-${Date.now()}`,
        text: language === "km" ? "⚡ រលកធាតុបំផ្លាញ !" : "⚡ SHOCKWAVE BLAST!",
        x: blastX,
        y: blastY - 40,
        vy: -2,
        alpha: 1,
        color: "#38bdf8",
        scale: 1.3,
      });

      // Shockwave sweeps all targets in blast range
      const blastRadius = 380;
      let waveSlices = 0;

      targetsRef.current.forEach((t) => {
        if (t.sliced) return;
        const dist = Math.hypot(t.x - blastX, t.y - blastY);

        if (dist <= blastRadius) {
          if (t.kind === "bomb") {
            // Deflect bombs away harmlessly!
            t.isDeflected = true;
            t.vx = ((t.x - blastX) / dist) * 18;
            t.vy = ((t.y - blastY) / dist) * 18 - 8;
            t.vRot = 0.35;
          } else {
            // Slices fruits with blast energy
            t.sliced = true;
            t.sliceAngle = Math.atan2(t.y - blastY, t.x - blastX);
            t.sliceTime = Date.now();
            waveSlices += 1;

            const splitSpeed = 6;
            const perpAngle = t.sliceAngle + Math.PI / 2;
            t.half1 = {
              x: t.x,
              y: t.y,
              vx: t.vx + Math.cos(perpAngle) * splitSpeed,
              vy: t.vy + Math.sin(perpAngle) * splitSpeed,
              rot: t.rotation,
              vRot: -0.12,
            };
            t.half2 = {
              x: t.x,
              y: t.y,
              vx: t.vx - Math.cos(perpAngle) * splitSpeed,
              vy: t.vy - Math.sin(perpAngle) * splitSpeed,
              rot: t.rotation,
              vRot: 0.12,
            };

            // Splat particles
            for (let i = 0; i < 12; i++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpd = Math.random() * 8 + 2;
              particlesRef.current.push({
                x: t.x,
                y: t.y,
                vx: Math.cos(pAngle) * pSpd,
                vy: Math.sin(pAngle) * pSpd,
                size: Math.random() * 4 + 2,
                color: t.innerColor,
                alpha: 1,
                decay: 0.025,
              });
            }
          }
        }
      });

      if (waveSlices > 0) {
        mouseGameSound.playSplat();
        const gainedScore = waveSlices * 150;
        setScore((s) => {
          const next = s + gainedScore;
          statsRef.current.score = next;
          return next;
        });
        statsRef.current.fruitsSliced += waveSlices;
      }
    },
    [shockwaveEnergy, language]
  );

  // Game Over handler
  const handleGameOver = useCallback(() => {
    setStatus("gameover");
    mouseGameSound.playGameOver();

    // Check high score
    const finalScore = statsRef.current.score;
    const currentBest = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);
    if (finalScore > currentBest) {
      setIsNewHighScore(true);
      setHighScore(finalScore);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
      } catch {}
    } else {
      setIsNewHighScore(false);
    }
  }, []);

  // Line segment collision detection against targets
  const checkBladeSlice = useCallback(
    (p1: { x: number; y: number }, p2: { x: number; y: number }, currentBladeSize: number) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq < 4) return; // Ignore microscopic jitter

      const swipeAngle = Math.atan2(dy, dx);

      targetsRef.current.forEach((t) => {
        if (t.sliced || t.isDeflected) return;

        // Calculate distance from target center to segment P1->P2
        const tVal = Math.max(
          0,
          Math.min(1, ((t.x - p1.x) * dx + (t.y - p1.y) * dy) / lenSq)
        );
        const projX = p1.x + tVal * dx;
        const projY = p1.y + tVal * dy;
        const distSq = (t.x - projX) ** 2 + (t.y - projY) ** 2;
        const hitThreshold = t.radius + currentBladeSize / 2;

        if (distSq <= hitThreshold * hitThreshold) {
          // HIT!
          if (t.kind === "bomb") {
            // Trap Bomb Detonation!
            t.sliced = true;
            mouseGameSound.playBombDetonate();
            statsRef.current.bombsDetonated += 1;

            // Violent explosion particles
            for (let i = 0; i < 24; i++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpd = Math.random() * 12 + 3;
              particlesRef.current.push({
                x: t.x,
                y: t.y,
                vx: Math.cos(pAngle) * pSpd,
                vy: Math.sin(pAngle) * pSpd,
                size: Math.random() * 5 + 3,
                color: i % 2 === 0 ? "#ef4444" : "#fbbf24",
                alpha: 1,
                decay: 0.03,
              });
            }

            // Floating text
            floatingTextsRef.current.push({
              id: `ft-bomb-${Date.now()}`,
              text: language === "km" ? "💥 ផ្ទុះគ្រាប់បែក! -1 បេះដូង" : "💥 BOMB HIT! -1 LIFE",
              x: t.x,
              y: t.y - 20,
              vy: -2,
              alpha: 1,
              color: "#ef4444",
              scale: 1.2,
            });

            // Reset combo and deduct life
            setCombo(0);
            statsRef.current.combo = 0;
            setLives((curr) => {
              const next = curr - 1;
              statsRef.current.lives = next;
              if (next <= 0) {
                // Game Over trigger
                handleGameOver();
              }
              return next;
            });
          } else if (t.kind === "golden") {
            // Golden Dragonfruit Slice
            t.sliced = true;
            t.sliceAngle = swipeAngle;
            t.sliceTime = Date.now();
            mouseGameSound.playGoldenFruit();

            statsRef.current.goldenFruitsSliced += 1;
            statsRef.current.fruitsSliced += 1;

            // Halves fly apart
            const splitSpeed = 8;
            const perpAngle = swipeAngle + Math.PI / 2;
            t.half1 = {
              x: t.x,
              y: t.y,
              vx: t.vx + Math.cos(perpAngle) * splitSpeed,
              vy: t.vy + Math.sin(perpAngle) * splitSpeed,
              rot: t.rotation,
              vRot: -0.15,
            };
            t.half2 = {
              x: t.x,
              y: t.y,
              vx: t.vx - Math.cos(perpAngle) * splitSpeed,
              vy: t.vy - Math.sin(perpAngle) * splitSpeed,
              rot: t.rotation,
              vRot: 0.15,
            };

            // Golden star particles
            for (let i = 0; i < 28; i++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpd = Math.random() * 10 + 2;
              particlesRef.current.push({
                x: t.x,
                y: t.y,
                vx: Math.cos(pAngle) * pSpd,
                vy: Math.sin(pAngle) * pSpd,
                size: Math.random() * 4 + 2,
                color: "#fef08a",
                alpha: 1,
                decay: 0.02,
              });
            }

            // INSTANT 100% SHOCKWAVE RECHARGE!
            setShockwaveEnergy(100);
            setScore((s) => {
              const bonus = 500 * Math.max(combo, 1);
              const next = s + bonus;
              statsRef.current.score = next;
              return next;
            });

            floatingTextsRef.current.push({
              id: `ft-gold-${Date.now()}`,
              text: language === "km" ? "🌟 ផ្លែឈើមាស +500 & ពេញរលកធាតុ!" : "🌟 GOLDEN +500 & RECHARGED!",
              x: t.x,
              y: t.y - 30,
              vy: -2.5,
              alpha: 1,
              color: "#fbbf24",
              scale: 1.35,
            });
          } else {
            // Normal Fruit Slice
            t.sliced = true;
            t.sliceAngle = swipeAngle;
            t.sliceTime = Date.now();
            mouseGameSound.playSplat();

            statsRef.current.fruitsSliced += 1;

            // Halves fly apart
            const splitSpeed = 6;
            const perpAngle = swipeAngle + Math.PI / 2;
            t.half1 = {
              x: t.x,
              y: t.y,
              vx: t.vx + Math.cos(perpAngle) * splitSpeed,
              vy: t.vy + Math.sin(perpAngle) * splitSpeed,
              rot: t.rotation,
              vRot: -0.1,
            };
            t.half2 = {
              x: t.x,
              y: t.y,
              vx: t.vx - Math.cos(perpAngle) * splitSpeed,
              vy: t.vy - Math.sin(perpAngle) * splitSpeed,
              rot: t.rotation,
              vRot: 0.1,
            };

            // Fruit juice splash particles
            for (let i = 0; i < 14; i++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpd = Math.random() * 7 + 2;
              particlesRef.current.push({
                x: t.x,
                y: t.y,
                vx: Math.cos(pAngle) * pSpd,
                vy: Math.sin(pAngle) * pSpd,
                size: Math.random() * 3 + 2,
                color: t.innerColor,
                alpha: 1,
                decay: 0.025,
              });
            }

            // Increase Shockwave energy (+12% per sliced fruit)
            setShockwaveEnergy((e) => Math.min(e + 12, 100));

            // Increase Combo
            setCombo((c) => {
              const nextCombo = c + 1;
              statsRef.current.combo = nextCombo;
              if (nextCombo > statsRef.current.maxCombo) {
                statsRef.current.maxCombo = nextCombo;
              }
              if (nextCombo > 1) {
                mouseGameSound.playCombo(nextCombo);
              }
              return nextCombo;
            });

            // Reset combo timer (resets after 1.8s of no slices)
            if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
            comboTimerRef.current = setTimeout(() => {
              setCombo(0);
              statsRef.current.combo = 0;
            }, 1800);

            // Compute score with combo multiplier
            const currentCombo = statsRef.current.combo;
            const points = 100 * Math.max(currentCombo, 1);
            setScore((s) => {
              const next = s + points;
              statsRef.current.score = next;
              return next;
            });

            floatingTextsRef.current.push({
              id: `ft-pts-${Date.now()}-${Math.random()}`,
              text: currentCombo > 1 ? `+${points} (x${currentCombo})` : `+${points}`,
              x: t.x,
              y: t.y - 20,
              vy: -1.8,
              alpha: 1,
              color: currentCombo > 2 ? "#fbbf24" : "#ffffff",
              scale: currentCombo > 2 ? 1.25 : 1,
            });
          }
        }
      });
    },
    [language, combo, handleGameOver]
  );

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    // Reset all gameplay variables
    targetsRef.current = [];
    bladeTrailRef.current = [];
    shockwavesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    setScore(0);
    setLives(3);
    setCombo(0);
    setShockwaveEnergy(30); // start with initial 30% boost
    setIsNewHighScore(false);

    statsRef.current = {
      score: 0,
      lives: 3,
      maxLives: 3,
      combo: 0,
      maxCombo: 0,
      fruitsSliced: 0,
      bombsDetonated: 0,
      goldenFruitsSliced: 0,
      shockwavesFired: 0,
      shockwaveEnergy: 30,
      bladeSize: 40,
      startTime: Date.now(),
    };

    lastSpawnTimeRef.current = 0; // Spawn first targets immediately
    setStatus("playing");
  }, []);

  // 60 FPS Main Animation & Physics Loop
  useEffect(() => {
    if (status !== "playing") {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const loop = () => {
      const { width, height } = canvasSize;

      // 1. Spawner logic
      const now = Date.now();
      const spawnInterval =
        difficulty === 1 ? 2200 : difficulty === 2 ? 1600 : 1100;

      if (now - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = now;
        // Spawn 1 to 3 items based on difficulty
        const spawnCount =
          difficulty === 1 ? 1 : difficulty === 2 ? (Math.random() < 0.6 ? 1 : 2) : (Math.random() < 0.4 ? 2 : 3);
        for (let i = 0; i < spawnCount; i++) {
          spawnTarget(width, height);
        }
      }

      // 2. Physics: Update Targets (gravity & velocity)
      const gravity = 0.28;
      const updatedTargets: MouseTargetItem[] = [];

      targetsRef.current.forEach((t) => {
        if (!t.sliced) {
          t.x += t.vx;
          t.y += t.vy;
          t.vy += gravity;
          t.rotation += t.vRot;

          // If unsliced fruit falls off bottom, it's missed
          if (t.y > height + 80 && t.vy > 0) {
            // In Level 3, missing non-bomb target also breaks combo
            if (t.kind !== "bomb") {
              setCombo(0);
              statsRef.current.combo = 0;
            }
          } else {
            updatedTargets.push(t);
          }
        } else {
          // Sliced halves physics
          if (t.half1 && t.half2) {
            t.half1.x += t.half1.vx;
            t.half1.y += t.half1.vy;
            t.half1.vy += gravity * 1.2;
            t.half1.rot += t.half1.vRot;

            t.half2.x += t.half2.vx;
            t.half2.y += t.half2.vy;
            t.half2.vy += gravity * 1.2;
            t.half2.rot += t.half2.vRot;

            // Retain until both halves leave bottom
            if (t.half1.y <= height + 100 || t.half2.y <= height + 100) {
              updatedTargets.push(t);
            }
          }
        }
      });
      targetsRef.current = updatedTargets;

      // 3. Update Shockwaves
      shockwavesRef.current = shockwavesRef.current.filter((sw) => {
        sw.radius += 18;
        sw.alpha -= 0.035;
        return sw.alpha > 0 && sw.radius < sw.maxRadius;
      });

      // 4. Update Blade Trail fading points
      const trailTtl = 260; // ms
      bladeTrailRef.current = bladeTrailRef.current.filter((p) => {
        const age = now - p.time;
        return age < trailTtl;
      });

      // 5. Update Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // light particle gravity
        p.alpha -= p.decay;
        return p.alpha > 0;
      });

      // 6. Update Floating Texts
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        return ft.alpha > 0;
      });

      // 7. Direct 60 FPS HTML5 Canvas Render
      if (canvasRef.current) {
        renderMouseGameCanvas(canvasRef.current, {
          targets: targetsRef.current,
          bladeTrail: bladeTrailRef.current,
          shockwaves: shockwavesRef.current,
          particles: particlesRef.current,
          floatingTexts: floatingTextsRef.current,
          cursorPos: cursorPosRef.current,
          bladeSize: statsRef.current.bladeSize,
          canvasWidth: width,
          canvasHeight: height,
          shockwaveReady: statsRef.current.shockwaveEnergy >= 100,
        });
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [status, canvasSize, difficulty, spawnTarget]);

  // Pointer Move Event (Tracks reticle and executes slicing when dragging)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const now = performance.now();
      const dt = Math.max(now - cursorPosRef.current.lastTime, 16);
      const vx = ((x - cursorPosRef.current.x) / dt) * 16;
      const vy = ((y - cursorPosRef.current.y) / dt) * 16;

      const prevPos = { x: cursorPosRef.current.x, y: cursorPosRef.current.y };
      cursorPosRef.current = {
        x,
        y,
        isDown: cursorPosRef.current.isDown,
        vx,
        vy,
        lastTime: now,
      };

      if (cursorPosRef.current.isDown && status === "playing") {
        // Add point to blade trail
        bladeTrailRef.current.push({
          x,
          y,
          time: Date.now(),
          width: bladeSize,
        });

        // Throttle blade whoosh sound
        if (now - whooshThrottleRef.current > 160 && Math.hypot(vx, vy) > 8) {
          mouseGameSound.playWhoosh(bladeSize);
          whooshThrottleRef.current = now;
        }

        // Check slicing collision along the path
        if (prevPos.x >= 0 && prevPos.y >= 0) {
          checkBladeSlice(prevPos, { x, y }, bladeSize);
        }
      } else if (status !== "playing") {
        drawFrame();
      }
    },
    [status, bladeSize, checkBladeSlice, drawFrame]
  );

  // Pointer Down (Left Click = Start slice drag, Right Click = Shockwave)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button === 2) {
        // Right click: Shockwave pulse!
        e.preventDefault();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        triggerShockwave(e.clientX - rect.left, e.clientY - rect.top);
        return;
      }

      if (e.button === 0) {
        cursorPosRef.current.isDown = true;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        bladeTrailRef.current.push({
          x,
          y,
          time: Date.now(),
          width: bladeSize,
        });
        mouseGameSound.playWhoosh(bladeSize);
      }
    },
    [bladeSize, triggerShockwave]
  );

  // Pointer Up
  const handlePointerUp = useCallback(() => {
    cursorPosRef.current.isDown = false;
  }, []);

  // Context Menu suppression & Right-Click trigger
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Non-passive Wheel Listener for Blade Sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent page scroll
      mouseGameSound.playBladeResize();

      setBladeSize((prev) => {
        // deltaY < 0 = scroll up (grow blade), deltaY > 0 = scroll down (shrink blade)
        const delta = e.deltaY < 0 ? 6 : -6;
        const next = Math.max(24, Math.min(76, prev + delta));
        statsRef.current.bladeSize = next;
        return next;
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={handleContextMenu}
      className="relative w-full h-screen min-h-[600px] overflow-hidden select-none bg-slate-950 font-khmer cursor-none touch-none"
    >
      {/* 60 FPS HTML5 Canvas Rendering */}
      <MouseGameCanvas
        ref={canvasRef}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
      />

      {/* Arcade HUD Overlay */}
      {status === "playing" && (
        <MouseGameHud
          score={score}
          highScore={highScore}
          lives={lives}
          maxLives={maxLives}
          combo={combo}
          shockwaveEnergy={shockwaveEnergy}
          bladeSize={bladeSize}
          language={language}
          difficulty={difficulty}
          isPaused={false}
          isMuted={isMuted}
          onTogglePause={() => setStatus("paused")}
          onToggleMute={handleToggleMute}
          onOpenMenu={() => setStatus("menu")}
        />
      )}

      {/* Paused Overlay */}
      {status === "paused" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-md font-khmer">
          <div className="bg-slate-900 border border-slate-700/80 p-6 sm:p-7 rounded-3xl text-center max-w-sm w-full mx-4 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 font-retro text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-300 mb-3">
              <span>{language === "km" ? "ផ្អាកការប្រកួត" : "GAME PAUSED"}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-retro text-white mb-2">
              {language === "km" ? "សម្រាកមួយភ្លែត!" : "Game Paused"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              {language === "km"
                ? "សម្រាកមួយភ្លែតមុននឹងបន្តកាប់ដាវ!"
                : "Take a breath before resuming slicing!"}
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setStatus("playing")}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:via-cyan-400 hover:to-blue-500 text-white font-retro text-xs sm:text-sm font-bold transition-all shadow-lg shadow-sky-500/30 active:scale-95 cursor-pointer"
              >
                {language === "km" ? "បន្តលេង" : "Resume"}
              </button>
              <button
                onClick={() => setStatus("menu")}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-retro text-[10px] sm:text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                {language === "km" ? "ម៉ឺនុយមេ" : "Main Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Startup & Mode Selection Modal */}
      <MouseGameModal
        isOpen={status === "menu"}
        selectedLanguage={language}
        selectedDifficulty={difficulty}
        highScore={highScore}
        onSelectLanguage={setLanguage}
        onSelectDifficulty={setDifficulty}
        onStartGame={handleStartGame}
      />

      {/* Game Over Results Modal */}
      <MouseGameOverModal
        isOpen={status === "gameover"}
        stats={statsRef.current}
        highScore={highScore}
        isNewHighScore={isNewHighScore}
        language={language}
        onRestart={handleStartGame}
        onChangeMode={() => setStatus("menu")}
      />
    </div>
  );
};
