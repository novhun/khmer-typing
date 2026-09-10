"use client";

import React, { useEffect, useRef } from "react";
import {
  FloatingText,
  FruitItem,
  Particle,
  SlashEffect,
} from "./types";

interface FruitCanvasProps {
  fruits: FruitItem[];
  particles: Particle[];
  slashEffects: SlashEffect[];
  floatingTexts: FloatingText[];
  canvasWidth: number;
  canvasHeight: number;
}

export const FruitCanvas: React.FC<FruitCanvasProps> = ({
  fruits,
  particles,
  slashEffects,
  floatingTexts,
  canvasWidth,
  canvasHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Set display size
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Subtle Dojo/Arcade Floor Grid & Ambient Glow
    drawBackground(ctx, canvasWidth, canvasHeight);

    // 2. Draw Slash Blade Trails
    drawSlashEffects(ctx, slashEffects);

    // 3. Draw Sliced Halves & Flying Fruits
    drawFruits(ctx, fruits);

    // 4. Draw Juice Particles
    drawParticles(ctx, particles);

    // 5. Draw Floating Text (Combo, points)
    drawFloatingTexts(ctx, floatingTexts);
  }, [fruits, particles, slashEffects, floatingTexts, canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block h-full w-full select-none pointer-events-none"
    />
  );
};

/* ------------------------------------------------------------------------- *
 * Canvas Rendering Sub-routines
 * ------------------------------------------------------------------------- */

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  // Deep dark arcade backdrop
  const bgGrad = ctx.createRadialGradient(
    w / 2,
    h * 0.7,
    50,
    w / 2,
    h * 0.7,
    Math.max(w, h) * 0.85
  );
  bgGrad.addColorStop(0, "#0c1322");
  bgGrad.addColorStop(0.5, "#080c18");
  bgGrad.addColorStop(1, "#030712");

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle bottom ambient light
  const floorGlow = ctx.createLinearGradient(0, h - 140, 0, h);
  floorGlow.addColorStop(0, "rgba(16, 185, 129, 0)");
  floorGlow.addColorStop(1, "rgba(16, 185, 129, 0.06)");
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, h - 140, w, 140);
}

function drawSlashEffects(ctx: CanvasRenderingContext2D, slashes: SlashEffect[]) {
  ctx.save();
  for (const slash of slashes) {
    const alpha = Math.max(slash.life / 18, 0);
    ctx.save();
    ctx.strokeStyle = slash.color || "#38bdf8";
    ctx.lineWidth = 4 * alpha;
    ctx.lineCap = "round";
    ctx.shadowColor = slash.color || "#38bdf8";
    ctx.shadowBlur = 16 * alpha;

    ctx.beginPath();
    ctx.moveTo(slash.startX, slash.startY);
    ctx.lineTo(slash.endX, slash.endY);
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2 * alpha;
    ctx.shadowBlur = 6 * alpha;
    ctx.beginPath();
    ctx.moveTo(slash.startX, slash.startY);
    ctx.lineTo(slash.endX, slash.endY);
    ctx.stroke();

    ctx.restore();
  }
  ctx.restore();
}

function drawFruits(ctx: CanvasRenderingContext2D, fruits: FruitItem[]) {
  for (const fruit of fruits) {
    if (fruit.sliced) {
      drawSlicedHalves(ctx, fruit);
    } else {
      drawWholeFruit(ctx, fruit);
    }
  }
}

function drawWholeFruit(ctx: CanvasRenderingContext2D, fruit: FruitItem) {
  ctx.save();
  ctx.translate(fruit.x, fruit.y);
  ctx.rotate(fruit.rotation);

  const r = fruit.radius;

  // Fruit body drop shadow
  ctx.shadowColor = fruit.color;
  ctx.shadowBlur = 14;

  // Outer Fruit circle
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = fruit.color;
  ctx.fill();

  // Reset shadow for inner details
  ctx.shadowBlur = 0;

  // Inner flesh
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.fillStyle = fruit.innerColor;
  ctx.fill();

  // Subtle rind stroke
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = fruit.color;
  ctx.stroke();

  // Center Emoji icon
  ctx.font = `${Math.round(r * 1.1)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(fruit.emoji, 0, 1);

  ctx.restore();

  // Draw the Target Word Badge below the fruit (un-rotated so it is always easy to read!)
  drawWordBadge(ctx, fruit);
}

function drawSlicedHalves(ctx: CanvasRenderingContext2D, fruit: FruitItem) {
  const { half1, half2, radius: r } = fruit;
  if (!half1 || !half2) return;

  // Half 1
  ctx.save();
  ctx.translate(half1.x, half1.y);
  ctx.rotate(half1.rot);
  drawHalfArc(ctx, r, fruit.color, fruit.innerColor, 1);
  ctx.restore();

  // Half 2
  ctx.save();
  ctx.translate(half2.x, half2.y);
  ctx.rotate(half2.rot);
  drawHalfArc(ctx, r, fruit.color, fruit.innerColor, -1);
  ctx.restore();
}

function drawHalfArc(
  ctx: CanvasRenderingContext2D,
  r: number,
  outerColor: string,
  innerColor: string,
  direction: number
) {
  ctx.save();
  ctx.beginPath();
  if (direction > 0) {
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  } else {
    ctx.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
  }
  ctx.closePath();
  ctx.fillStyle = outerColor;
  ctx.fill();

  // Inner juicy core
  ctx.beginPath();
  if (direction > 0) {
    ctx.arc(0, 0, r * 0.75, -Math.PI / 2, Math.PI / 2);
  } else {
    ctx.arc(0, 0, r * 0.75, Math.PI / 2, (3 * Math.PI) / 2);
  }
  ctx.closePath();
  ctx.fillStyle = innerColor;
  ctx.fill();

  ctx.restore();
}

function drawWordBadge(ctx: CanvasRenderingContext2D, fruit: FruitItem) {
  ctx.save();

  const badgeY = fruit.y + fruit.radius + 24;
  const word = fruit.word;
  const typed = fruit.typedProgress;
  const isTargeted = typed.length > 0;

  // Font setup: Canvas 2D does NOT resolve CSS var(); use global font-family names
  const fontSize = word.length > 6 ? 18 : word.length > 3 ? 20 : 24;
  ctx.font = `bold ${fontSize}px "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS System", "Leelawadee UI", sans-serif`;

  const textMetrics = ctx.measureText(word);
  const textWidth = textMetrics.width;
  const paddingX = 14;
  const paddingY = 6;
  const badgeWidth = textWidth + paddingX * 2;
  const badgeHeight = fontSize + paddingY * 2;

  const badgeX = fruit.x - badgeWidth / 2;
  const badgeTop = badgeY - badgeHeight / 2;

  // Background pill
  ctx.beginPath();
  roundRect(ctx, badgeX, badgeTop, badgeWidth, badgeHeight, 12);
  ctx.fillStyle = isTargeted
    ? "rgba(6, 78, 59, 0.9)"
    : "rgba(15, 23, 42, 0.88)";
  ctx.fill();

  // Border
  ctx.lineWidth = isTargeted ? 2.5 : 1.5;
  ctx.strokeStyle = isTargeted ? "#34d399" : "rgba(255, 255, 255, 0.25)";
  if (isTargeted) {
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 10;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw Text with prefix color highlighting
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  if (typed.length > 0 && word.startsWith(typed)) {
    // Typed portion (Bright Emerald Green)
    const typedWidth = ctx.measureText(typed).width;
    const startX = fruit.x - textWidth / 2;

    ctx.fillStyle = "#34d399";
    ctx.shadowColor = "#34d399";
    ctx.shadowBlur = 6;
    ctx.fillText(typed, startX, badgeY);

    // Remaining portion (Bright Crisp White)
    const remaining = word.slice(typed.length);
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 0;
    ctx.fillText(remaining, startX + typedWidth, badgeY);
  } else {
    // Un-typed text (Crisp White with subtle warm tint)
    ctx.textAlign = "center";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(word, fruit.x, badgeY);
  }

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(p.alpha, 0);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawFloatingTexts(
  ctx: CanvasRenderingContext2D,
  floatingTexts: FloatingText[]
) {
  ctx.save();
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(ft.alpha, 0);
    ctx.translate(ft.x, ft.y);
    ctx.scale(ft.scale, ft.scale);

    ctx.font = 'bold 16px "Press Start 2P", "Kantumruy Pro", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Text Outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeText(ft.text, 0, 0);

    // Text Fill
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.fillText(ft.text, 0, 0);

    ctx.restore();
  }
  ctx.restore();
}

/** Helper to draw rounded rectangle on Canvas */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
