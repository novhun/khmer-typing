"use client";

import React from "react";
import {
  BladeTrailPoint,
  FloatingText,
  MouseTargetItem,
  Particle,
  Shockwave,
} from "./types";

export interface MouseGameCanvasProps {
  canvasWidth: number;
  canvasHeight: number;
}

export const MouseGameCanvas = React.forwardRef<
  HTMLCanvasElement,
  MouseGameCanvasProps
>(({ canvasWidth, canvasHeight }, ref) => {
  return (
    <canvas
      ref={ref}
      style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
      className="pointer-events-none absolute inset-0 block h-full w-full select-none cursor-none"
    />
  );
});

MouseGameCanvas.displayName = "MouseGameCanvas";

export function renderMouseGameCanvas(
  canvas: HTMLCanvasElement,
  data: {
    targets: MouseTargetItem[];
    bladeTrail: BladeTrailPoint[];
    shockwaves: Shockwave[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    cursorPos: {
      x: number;
      y: number;
      isDown: boolean;
      vx: number;
      vy: number;
    };
    bladeSize: number;
    canvasWidth: number;
    canvasHeight: number;
    shockwaveReady: boolean;
  }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const {
    targets,
    bladeTrail,
    shockwaves,
    particles,
    floatingTexts,
    cursorPos,
    bladeSize,
    canvasWidth,
    canvasHeight,
    shockwaveReady,
  } = data;

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const targetW = Math.round(canvasWidth * dpr);
  const targetH = Math.round(canvasHeight * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Deep Cyber/Dojo Backdrop
  drawBackdrop(ctx, canvasWidth, canvasHeight);

  // 2. Draw Shockwaves
  drawShockwaves(ctx, shockwaves);

  // 3. Draw Blade Trail (left-click drag)
  drawBladeTrail(ctx, bladeTrail, bladeSize);

  // 4. Draw Targets (Fruits, Bombs, Golden)
  drawTargets(ctx, targets);

  // 5. Draw Particles
  drawParticles(ctx, particles);

  // 6. Draw Floating Texts
  drawFloatingTexts(ctx, floatingTexts);

  // 7. Draw Custom Cursor Reticle
  drawCustomCursor(ctx, cursorPos, bladeSize, shockwaveReady);

  ctx.restore();
}

/* ------------------------------------------------------------------------- *
 * Canvas Rendering Routines
 * ------------------------------------------------------------------------- */

function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep arcade gradient
  const bgGrad = ctx.createRadialGradient(
    w / 2,
    h * 0.65,
    60,
    w / 2,
    h * 0.65,
    Math.max(w, h) * 0.85
  );
  bgGrad.addColorStop(0, "#080f24");
  bgGrad.addColorStop(0.5, "#040916");
  bgGrad.addColorStop(1, "#02040a");

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // High-tech subtle grid floor
  ctx.save();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
  ctx.lineWidth = 1;
  const gridSize = 64;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Soft bottom aura
  const bottomGlow = ctx.createLinearGradient(0, h - 160, 0, h);
  bottomGlow.addColorStop(0, "rgba(14, 165, 233, 0)");
  bottomGlow.addColorStop(1, "rgba(14, 165, 233, 0.08)");
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, h - 160, w, 160);
  ctx.restore();
}

function drawShockwaves(ctx: CanvasRenderingContext2D, shockwaves: Shockwave[]) {
  if (shockwaves.length === 0) return;

  shockwaves.forEach((sw) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.lineWidth = 6 * (1 - sw.radius / sw.maxRadius) + 2;
    ctx.strokeStyle = `rgba(56, 189, 248, ${sw.alpha * 0.85})`;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 24;
    ctx.stroke();

    // Inner secondary pulse
    if (sw.radius > 20) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius * 0.75, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(224, 242, 254, ${sw.alpha * 0.5})`;
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawBladeTrail(
  ctx: CanvasRenderingContext2D,
  points: BladeTrailPoint[],
  currentBladeSize: number
) {
  if (points.length < 2) return;

  const now = Date.now();
  const trailTtl = 260; // ms

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Outer glow
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const avgWidth = ((p1.width + p2.width) / 2) * (currentBladeSize / 40);
    const age = now - (p1.time + p2.time) / 2;
    const alpha = Math.max(0, 1 - age / trailTtl);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = Math.max(avgWidth * 1.6, 6);
    ctx.strokeStyle = `rgba(14, 165, 233, ${(alpha * 0.6).toFixed(3)})`;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 18;
    ctx.stroke();
  }

  // Inner hot cyan blade
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const avgWidth = ((p1.width + p2.width) / 2) * (currentBladeSize / 40);
    const age = now - (p1.time + p2.time) / 2;
    const alpha = Math.max(0, 1 - age / trailTtl);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = Math.max(avgWidth * 0.8, 4);
    ctx.strokeStyle = `rgba(125, 211, 252, ${(alpha * 0.9).toFixed(3)})`;
    ctx.shadowBlur = 8;
    ctx.stroke();
  }

  // Core white spine
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const age = now - (p1.time + p2.time) / 2;
    const alpha = Math.max(0, 1 - age / trailTtl);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }
  ctx.restore();
}

function drawTargets(ctx: CanvasRenderingContext2D, targets: MouseTargetItem[]) {
  targets.forEach((target) => {
    if (target.sliced) {
      drawSlicedTarget(ctx, target);
    } else {
      drawIntactTarget(ctx, target);
    }
  });
}

function drawIntactTarget(ctx: CanvasRenderingContext2D, t: MouseTargetItem) {
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);

  if (t.kind === "bomb") {
    // 💣 Trap Bomb Item
    drawBombItem(ctx, t);
  } else if (t.kind === "golden") {
    // 🌟 Golden Dragonfruit Item
    drawGoldenItem(ctx, t);
  } else {
    // 🍉 Regular Fruit Item
    drawFruitItem(ctx, t);
  }

  ctx.restore();

  // Draw word badge (un-rotated for readability)
  drawTargetWordBadge(ctx, t);
}

function drawBombItem(ctx: CanvasRenderingContext2D, t: MouseTargetItem) {
  const r = t.radius;

  // Deflection shield if repelled by shockwave
  if (t.isDeflected) {
    ctx.beginPath();
    ctx.arc(0, 0, r + 14, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 16;
    ctx.stroke();
  }

  // Bomb body gradient
  const bombGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r);
  bombGrad.addColorStop(0, "#475569");
  bombGrad.addColorStop(0.5, "#1e293b");
  bombGrad.addColorStop(1, "#090d16");

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = bombGrad;
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 16;
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#ef4444";
  ctx.stroke();

  // Fuse neck
  ctx.fillStyle = "#64748b";
  ctx.fillRect(-6, -r - 8, 12, 9);

  // Fuse spark
  const sparkY = -r - 12;
  ctx.beginPath();
  ctx.arc(0, sparkY, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#fbbf24";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 10;
  ctx.fill();

  // Skull or bomb emoji in center
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(r * 1.1)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("💣", 0, 2);
}

function drawGoldenItem(ctx: CanvasRenderingContext2D, t: MouseTargetItem) {
  const r = t.radius;

  // Golden radiant aura
  const aura = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r + 16);
  aura.addColorStop(0, "rgba(251, 191, 36, 0.4)");
  aura.addColorStop(0.7, "rgba(245, 158, 11, 0.15)");
  aura.addColorStop(1, "rgba(245, 158, 11, 0)");

  ctx.beginPath();
  ctx.arc(0, 0, r + 16, 0, Math.PI * 2);
  ctx.fillStyle = aura;
  ctx.fill();

  // Outer sphere
  const goldGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r);
  goldGrad.addColorStop(0, "#fef08a");
  goldGrad.addColorStop(0.4, "#f59e0b");
  goldGrad.addColorStop(1, "#b45309");

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = goldGrad;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 24;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#fef08a";
  ctx.stroke();

  // Star emoji
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(r * 1.15)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🌟", 0, 0);
}

function drawFruitItem(ctx: CanvasRenderingContext2D, t: MouseTargetItem) {
  const r = t.radius;

  // Outer peel glow
  const fruitGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r);
  fruitGrad.addColorStop(0, t.innerColor);
  fruitGrad.addColorStop(0.65, t.color);
  fruitGrad.addColorStop(1, "#000000");

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = fruitGrad;
  ctx.shadowColor = t.color;
  ctx.shadowBlur = 14;
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = t.innerColor;
  ctx.stroke();

  // Center Emoji
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(r * 1.15)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t.emoji, 0, 1);
}

function drawSlicedTarget(ctx: CanvasRenderingContext2D, t: MouseTargetItem) {
  if (!t.half1 || !t.half2) return;

  const r = t.radius;

  [t.half1, t.half2].forEach((h) => {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot);

    // Half circle path
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI);
    ctx.closePath();

    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 10;
    ctx.fill();

    // Inner juicy flat cut face
    ctx.fillStyle = t.innerColor;
    ctx.shadowBlur = 0;
    ctx.fillRect(-r * 0.85, -2, r * 1.7, 4);

    ctx.restore();
  });
}

function drawTargetWordBadge(ctx: CanvasRenderingContext2D, t: MouseTargetItem) {
  if (!t.word) return;

  ctx.save();
  // Fixed font with Kantumruy Pro & Noto Sans Khmer for stacked coeng support
  const fontSize = t.kind === "golden" ? 17 : 16;
  ctx.font = `bold ${fontSize}px "Kantumruy Pro", "Noto Sans Khmer", sans-serif`;

  const textMetrics = ctx.measureText(t.word);
  const textWidth = textMetrics.width;
  const paddingX = 14;
  const badgeWidth = textWidth + paddingX * 2;
  const badgeHeight = 32;

  // Position badge slightly below the target
  const badgeX = t.x - badgeWidth / 2;
  const badgeY = t.y + t.radius + 10;

  // Pill badge background
  ctx.beginPath();
  const radius = badgeHeight / 2;
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, radius);

  if (t.kind === "bomb") {
    ctx.fillStyle = "rgba(220, 38, 38, 0.88)";
    ctx.strokeStyle = "#fca5a5";
  } else if (t.kind === "golden") {
    ctx.fillStyle = "rgba(217, 119, 6, 0.9)";
    ctx.strokeStyle = "#fef08a";
  } else {
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
  }

  ctx.lineWidth = 1.5;
  ctx.shadowColor = t.kind === "bomb" ? "#ef4444" : "#38bdf8";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.stroke();

  // Text label
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t.word, t.x, badgeY + badgeHeight / 2 + 1);

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(p.alpha, 0);
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  });
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  texts.forEach((ft) => {
    ctx.save();
    ctx.font = `bold ${Math.round(18 * (ft.scale || 1))}px "Press Start 2P", "Kantumruy Pro", sans-serif`;
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(ft.alpha, 0);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 12;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

function drawCustomCursor(
  ctx: CanvasRenderingContext2D,
  cursor: { x: number; y: number; isDown: boolean; vx: number; vy: number },
  bladeSize: number,
  shockwaveReady: boolean
) {
  const { x, y, isDown, vx, vy } = cursor;
  if (x < 0 || y < 0) return;

  ctx.save();
  ctx.translate(x, y);

  // Rotate blade reticle towards velocity vector if moving
  const speed = Math.hypot(vx, vy);
  const angle = speed > 1.5 ? Math.atan2(vy, vx) : -Math.PI / 4;
  ctx.rotate(angle);

  const halfReach = bladeSize / 2;

  // Outer Blade Reach Indicator Ring
  ctx.beginPath();
  ctx.arc(0, 0, halfReach, 0, Math.PI * 2);
  ctx.lineWidth = isDown ? 2.5 : 1.5;
  ctx.strokeStyle = shockwaveReady
    ? "rgba(56, 189, 248, 0.75)"
    : "rgba(255, 255, 255, 0.35)";
  ctx.setLineDash(isDown ? [] : [4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Shockwave ready pulsing halo
  if (shockwaveReady) {
    ctx.beginPath();
    ctx.arc(0, 0, halfReach + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Blade crosshair reticle
  ctx.strokeStyle = isDown ? "#38bdf8" : "#ffffff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = isDown ? 12 : 6;

  // Blade spine line
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(18, 0);
  ctx.stroke();

  // Guard notch
  ctx.beginPath();
  ctx.moveTo(2, -8);
  ctx.lineTo(2, 8);
  ctx.stroke();

  // Center point
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = isDown ? "#38bdf8" : "#ffffff";
  ctx.fill();

  ctx.restore();
}
