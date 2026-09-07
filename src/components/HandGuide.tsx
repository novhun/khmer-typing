"use client";

/**
 * Which finger to use, drawn as a pair of stylised hands.
 *
 * The colour of each finger matches the strip along the bottom of its keys in
 * <VirtualKeyboard>, so "green key -> green finger" is learnable at a glance.
 */

import { memo } from "react";

import { useApp } from "@/context/AppProviders";
import { FINGER_COLOR, type Finger } from "@/lib/keyboard";

/** Relative finger heights, index-to-pinky, so the silhouette reads as a hand. */
const LEFT_FINGERS: { finger: Finger; height: number }[] = [
  { finger: "l-pinky", height: 58 },
  { finger: "l-ring", height: 82 },
  { finger: "l-middle", height: 100 },
  { finger: "l-index", height: 88 },
];

const RIGHT_FINGERS: { finger: Finger; height: number }[] = [
  { finger: "r-index", height: 88 },
  { finger: "r-middle", height: 100 },
  { finger: "r-ring", height: 82 },
  { finger: "r-pinky", height: 58 },
];

function Digit({ finger, height, active }: { finger: Finger; height: number; active: boolean }) {
  return (
    <div
      className={[
        "w-2 sm:w-2.5 rounded-t-full border border-[var(--panel-edge)] transition-all duration-150",
        active ? "anim-pop scale-110 ring-1 ring-[var(--panel-edge)] shadow-sm opacity-100" : "opacity-45",
      ].join(" ")}
      style={{
        height: `${height}%`,
        background: active ? FINGER_COLOR[finger] : "var(--key-face)",
      }}
    />
  );
}

function Hand({
  side,
  active,
  thumbActive,
}: {
  side: "left" | "right";
  active: Finger | null;
  thumbActive: boolean;
}) {
  const fingers = side === "left" ? LEFT_FINGERS : RIGHT_FINGERS;
  const thumb = (
    <div
      className={[
        "h-2 w-4 sm:h-2.5 sm:w-5 self-end rounded-full border border-[var(--panel-edge)] transition-all duration-150",
        side === "left" ? "-rotate-12" : "rotate-12",
        thumbActive ? "anim-pop scale-110 ring-1 ring-[var(--panel-edge)] shadow-sm opacity-100" : "opacity-45",
      ].join(" ")}
      style={{ background: thumbActive ? FINGER_COLOR.thumb : "var(--key-face)" }}
    />
  );

  return (
    <div className="flex h-7 sm:h-8 items-end gap-0.5">
      {side === "right" ? thumb : null}
      <div className="flex h-full items-end gap-0.5">
        {fingers.map(({ finger, height }) => (
          <Digit key={finger} finger={finger} height={height} active={active === finger} />
        ))}
      </div>
      {side === "left" ? thumb : null}
    </div>
  );
}

export const HandGuide = memo(function HandGuide({ finger }: { finger: Finger | null }) {
  const { t } = useApp();
  const isThumb = finger === "thumb";

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
      <div className="flex items-end gap-2 sm:gap-2.5">
        <Hand side="left" active={finger} thumbActive={isThumb} />
        <Hand side="right" active={finger} thumbActive={isThumb} />
      </div>
      {finger ? (
        <span
          className="rounded border border-[var(--panel-edge)] bg-[var(--key-face)] px-1.5 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold text-[var(--ink)] whitespace-nowrap"
          aria-live="polite"
        >
          {t(`fingers.${finger}`)}
        </span>
      ) : null}
    </div>
  );
});
