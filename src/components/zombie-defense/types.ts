export type LanguageMode = "km" | "en";
export type DifficultyLevel = 1 | 2 | 3;
export type GameStatus = "menu" | "playing" | "paused" | "gameover" | "victory";
export type ZombieType = "walker" | "runner" | "brute";

export interface ZombieItem {
  id: string;
  word: string;
  typedProgress: string;
  x: number;
  y: number;
  lane: number;
  speed: number;
  type: ZombieType;
  maxHp: number;
  hp: number;
  radius: number;
  wobble: number;
  isTargeted: boolean;
  isEliminated: boolean;
  eliminatedTime: number;
}

export interface LaserShot {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale?: number;
}

export interface GameStats {
  score: number;
  wave: number;
  baseHealth: number; // 0 to 100
  combo: number;
  maxCombo: number;
  zombiesEliminated: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  startTime: number;
}
