export type LanguageMode = "km" | "en";
export type DifficultyLevel = 1 | 2 | 3;
export type GameStatus = "menu" | "playing" | "paused" | "gameover";
export type TargetKind = "fruit" | "bomb" | "golden";

export interface FruitHalf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
}

export interface MouseTargetItem {
  id: string;
  word: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  kind: TargetKind;
  color: string;
  innerColor: string;
  emoji: string;
  sliced: boolean;
  sliceAngle: number;
  sliceTime: number;
  half1?: FruitHalf;
  half2?: FruitHalf;
  rotation: number;
  vRot: number;
  isDeflected?: boolean;
  markedForRemoval?: boolean;
}

export interface BladeTrailPoint {
  x: number;
  y: number;
  time: number;
  width: number;
}

export interface Shockwave {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
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
  lives: number;
  maxLives: number;
  combo: number;
  maxCombo: number;
  fruitsSliced: number;
  bombsDetonated: number;
  goldenFruitsSliced: number;
  shockwavesFired: number;
  shockwaveEnergy: number; // 0 to 100
  bladeSize: number; // 24 to 76 px
  startTime: number;
}
