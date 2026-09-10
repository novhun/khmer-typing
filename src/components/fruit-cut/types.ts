export type LanguageMode = "km" | "en";
export type DifficultyLevel = 1 | 2 | 3;
export type GameStatus = "menu" | "playing" | "paused" | "gameover";

export type FruitKind =
  | "watermelon"
  | "orange"
  | "apple"
  | "banana"
  | "strawberry"
  | "coconut"
  | "dragonfruit"
  | "pineapple";

export interface FruitConfig {
  kind: FruitKind;
  nameEn: string;
  nameKm: string;
  emoji: string;
  color: string;
  innerColor: string;
  radius: number;
}

export interface FruitHalf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
}

export interface FruitItem {
  id: string;
  word: string;
  typedProgress: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  kind: FruitKind;
  color: string;
  innerColor: string;
  emoji: string;
  sliced: boolean;
  sliceAngle: number;
  sliceTime: number;
  half1?: FruitHalf;
  half2?: FruitHalf;
  missed: boolean;
  markedForRemoval: boolean;
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
  gravity: number;
}

export interface SlashEffect {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number; // 0 to 1
  life: number;     // Remaining frames or ms
  color: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  scale: number;
  color: string;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  maxLives: number;
  slicedCount: number;
  missedCount: number;
  totalTypedKeystrokes: number;
  correctTypedKeystrokes: number;
  startTime: number;
  endTime: number;
}
