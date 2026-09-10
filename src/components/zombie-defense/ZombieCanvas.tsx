"use client";

import React, { useEffect, useRef } from "react";
import { FloatingText, LaserShot, Particle, ZombieItem } from "./types";

interface ZombieCanvasProps {
  zombies: ZombieItem[];
  particles: Particle[];
  lasers: LaserShot[];
  floatingTexts: FloatingText[];
  baseHealth: number;
  screenShake: number;
  canvasWidth: number;
  canvasHeight: number;
}

export const ZombieCanvas: React.FC<ZombieCanvasProps> = ({
  zombies,
  particles,
  lasers,
  floatingTexts,
  baseHealth,
  screenShake,
  canvasWidth,
  canvasHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina DPI handling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    const now = performance.now();

    // 1. Clear background & apply screen shake
    ctx.save();
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 8;
      const shakeY = (Math.random() - 0.5) * screenShake * 8;
      ctx.translate(shakeX, shakeY);
    }

    // Deep apocalyptic gradient
    const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    bgGrad.addColorStop(0, "#080c16");
    bgGrad.addColorStop(0.5, "#0b1120");
    bgGrad.addColorStop(1, "#050811");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw 4 Defense Lanes
    const laneCount = 4;
    const laneHeight = canvasHeight / laneCount;
    const baseWallX = 110;

    for (let i = 0; i < laneCount; i++) {
      const y = i * laneHeight;

      // Lane separator
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(baseWallX, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();

      // Dashed middle guide line
      ctx.setLineDash([12, 18]);
      ctx.strokeStyle = "rgba(30, 41, 59, 0.5)";
      ctx.beginPath();
      ctx.moveTo(baseWallX, y + laneHeight / 2);
      ctx.lineTo(canvasWidth, y + laneHeight / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw Player Bunker & Energy Shield Base (Left side)
    // Bunker Wall
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, baseWallX, canvasHeight);

    // Steel Wall Edge
    const wallGrad = ctx.createLinearGradient(baseWallX - 15, 0, baseWallX, 0);
    wallGrad.addColorStop(0, "#1e293b");
    wallGrad.addColorStop(1, "#334155");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(baseWallX - 15, 0, 15, canvasHeight);

    // Hazard Stripes on Bunker Edge
    ctx.save();
    ctx.beginPath();
    ctx.rect(baseWallX - 12, 0, 10, canvasHeight);
    ctx.clip();
    const stripeWidth = 14;
    for (let y = -stripeWidth; y < canvasHeight + stripeWidth; y += stripeWidth * 2) {
      ctx.fillStyle = "rgba(234, 179, 8, 0.35)"; // Yellow hazard
      ctx.beginPath();
      ctx.moveTo(baseWallX - 12, y);
      ctx.lineTo(baseWallX - 2, y + stripeWidth);
      ctx.lineTo(baseWallX - 2, y + stripeWidth * 1.5);
      ctx.lineTo(baseWallX - 12, y + stripeWidth * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Glowing Force Field Shield Line
    const shieldOsc = Math.sin(now * 0.005) * 3;
    const shieldColor =
      baseHealth > 50
        ? "rgba(16, 185, 129, "
        : baseHealth > 25
        ? "rgba(245, 158, 11, "
        : "rgba(239, 68, 68, ";

    ctx.strokeStyle = shieldColor + "0.8)";
    ctx.lineWidth = 3;
    ctx.shadowColor = shieldColor + "1)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(baseWallX + shieldOsc, 0);
    ctx.lineTo(baseWallX + shieldOsc, canvasHeight);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Draw Plasma Turret (tracks closest or targeted zombie)
    const targetZombie = zombies.find((z) => z.isTargeted && !z.isEliminated);
    const closestZombie =
      targetZombie ||
      zombies
        .filter((z) => !z.isEliminated)
        .sort((a, b) => a.x - b.x)[0];

    const turretX = 45;
    const turretY = closestZombie ? closestZombie.y : canvasHeight / 2;
    const turretAngle = closestZombie
      ? Math.atan2(closestZombie.y - turretY, closestZombie.x - turretX)
      : 0;

    // Turret Base
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(turretX, turretY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Turret Barrel (rotating toward target)
    ctx.save();
    ctx.translate(turretX, turretY);
    ctx.rotate(turretAngle);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(10, -5, 26, 10);
    ctx.strokeStyle = "#0284c7";
    ctx.strokeRect(10, -5, 26, 10);

    // Barrel Core Glow
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(16, -2, 18, 4);
    ctx.restore();

    // 5. Draw Zombies
    zombies.forEach((z) => {
      if (z.isEliminated) return;

      const zWobble = Math.sin(z.wobble) * 0.12;

      ctx.save();
      ctx.translate(z.x, z.y);
      ctx.rotate(zWobble);

      // Target lock-on indicator halo
      if (z.isTargeted) {
        ctx.strokeStyle = "rgba(52, 211, 153, 0.85)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius + 10, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        const crSize = z.radius + 15;
        ctx.beginPath();
        ctx.moveTo(-crSize, 0);
        ctx.lineTo(-crSize + 6, 0);
        ctx.moveTo(crSize, 0);
        ctx.lineTo(crSize - 6, 0);
        ctx.moveTo(0, -crSize);
        ctx.lineTo(0, -crSize + 6);
        ctx.moveTo(0, crSize);
        ctx.lineTo(0, crSize - 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Zombie Body Rendering based on type
      if (z.type === "runner") {
        // Fast Runner (Orange glow, slender posture)
        ctx.fillStyle = "#ea580c";
        ctx.shadowColor = "rgba(249, 115, 22, 0.7)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();

        // Runner Visage
        ctx.fillStyle = "#ffedd5";
        ctx.beginPath();
        ctx.arc(-z.radius * 0.2, -z.radius * 0.2, 4, 0, Math.PI * 2);
        ctx.arc(-z.radius * 0.2, z.radius * 0.2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (z.type === "brute") {
        // Heavy Brute (Purple/Crimson armored bulk)
        ctx.fillStyle = "#7e22ce";
        ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();

        // Armor plates
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Menacing red glowing eyes
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(-z.radius * 0.3, -z.radius * 0.2, 5, 0, Math.PI * 2);
        ctx.arc(-z.radius * 0.3, z.radius * 0.2, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard Walker (Radioactive green)
        ctx.fillStyle = "#15803d";
        ctx.shadowColor = "rgba(34, 197, 94, 0.7)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();

        // Walker eyes
        ctx.fillStyle = "#bbf7d0";
        ctx.beginPath();
        ctx.arc(-z.radius * 0.25, -z.radius * 0.2, 4, 0, Math.PI * 2);
        ctx.arc(-z.radius * 0.25, z.radius * 0.2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Zombie Type Icon Emoji
      ctx.font = `${Math.floor(z.radius * 0.9)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        z.type === "runner" ? "🏃" : z.type === "brute" ? "👹" : "🧟",
        0,
        0
      );

      ctx.restore();

      // 6. Target Word Badge (Rendered cleanly above zombie)
      ctx.save();
      // Setup font directly for Khmer rendering
      const fontSize = 16;
      ctx.font = `bold ${fontSize}px "Kantumruy Pro", "Noto Sans Khmer", sans-serif`;
      ctx.textBaseline = "middle";

      const wordWidth = ctx.measureText(z.word).width;
      const badgePaddingX = 14;
      const badgeHeight = 28;
      const badgeWidth = Math.max(wordWidth + badgePaddingX * 2, 50);
      const badgeX = z.x - badgeWidth / 2;
      const badgeY = z.y - z.radius - 24;

      // Badge Container Box
      ctx.fillStyle = z.isTargeted
        ? "rgba(2, 6, 23, 0.9)"
        : "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = z.isTargeted
        ? "rgba(52, 211, 153, 0.9)"
        : "rgba(148, 163, 184, 0.35)";
      ctx.lineWidth = z.isTargeted ? 2 : 1;

      if (z.isTargeted) {
        ctx.shadowColor = "rgba(52, 211, 153, 0.6)";
        ctx.shadowBlur = 8;
      }

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Word with Prefix Highlight
      const textStartX = badgeX + badgePaddingX;
      const textCenterY = badgeY + badgeHeight / 2 + 1;

      if (z.typedProgress.length > 0) {
        const typedPart = z.typedProgress;
        const remainingPart = z.word.slice(typedPart.length);

        // Typed prefix (Neon Green)
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "rgba(52, 211, 153, 0.9)";
        ctx.shadowBlur = 6;
        ctx.fillText(typedPart, textStartX, textCenterY);
        ctx.shadowBlur = 0;

        // Remaining un-typed suffix (Crisp White)
        const typedWidth = ctx.measureText(typedPart).width;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(remainingPart, textStartX + typedWidth, textCenterY);
      } else {
        // Whole word un-typed
        ctx.fillStyle = z.isTargeted ? "#ffffff" : "#cbd5e1";
        ctx.fillText(z.word, textStartX, textCenterY);
      }

      ctx.restore();
    });

    // 7. Draw Plasma Laser Shots
    lasers.forEach((laser) => {
      ctx.save();
      const alpha = laser.life / laser.maxLife;

      // Outer laser aura
      ctx.strokeStyle = laser.color;
      ctx.lineWidth = 6 * alpha;
      ctx.shadowColor = laser.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(laser.startX, laser.startY);
      ctx.lineTo(laser.targetX, laser.targetY);
      ctx.stroke();

      // White core laser bolt
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2 * alpha;
      ctx.beginPath();
      ctx.moveTo(laser.startX, laser.startY);
      ctx.lineTo(laser.targetX, laser.targetY);
      ctx.stroke();
      ctx.restore();
    });

    // 8. Draw Acid / Blood Particles
    particles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 9. Draw Floating Texts (+100, +250, COMBO x5)
    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.font = `bold ${Math.floor(14 * (ft.scale || 1))}px "Press Start 2P", "Kantumruy Pro", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(ft.alpha, 0);
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore(); // Restore screen shake
  }, [
    baseHealth,
    canvasHeight,
    canvasWidth,
    floatingTexts,
    lasers,
    particles,
    screenShake,
    zombies,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full block pointer-events-none"
      style={{ width: canvasWidth, height: canvasHeight }}
    />
  );
};
