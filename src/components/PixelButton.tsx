"use client";

/** Shared 8-bit button. `tone` maps to the retro palette rather than raw colours. */

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "primary" | "coin" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  primary: "bg-[#2f6fd0] text-white",
  coin: "bg-[var(--coin)] text-[#1b1b2f]",
  danger: "bg-[var(--miss)] text-white",
  neutral: "bg-[var(--key-face)] text-[var(--key-ink)]",
};

export function PixelButton({
  children,
  tone = "neutral",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; children: ReactNode }) {
  return (
    <button
      type="button"
      className={[
        "pixel-btn focus-ring rounded-[4px] px-3 py-2 font-retro text-[10px] uppercase leading-none sm:text-[11px]",
        TONES[tone],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
