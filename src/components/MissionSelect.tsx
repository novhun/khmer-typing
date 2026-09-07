"use client";

/**
 * Level select. Missions unlock in order, with the first mission of each script
 * always available so a learner can jump straight to the English track.
 */

import { useApp } from "@/context/AppProviders";
import { MISSIONS, missionLength, type Mission } from "@/lib/missions";
import { sfx } from "@/lib/sfx";
import { PixelButton } from "./PixelButton";

const ALWAYS_UNLOCKED = new Set(["kh-home-row", "en-home-row"]);

export function isUnlocked(index: number, cleared: ReadonlySet<string>): boolean {
  const mission = MISSIONS[index];
  if (ALWAYS_UNLOCKED.has(mission.id)) return true;
  const previous = MISSIONS[index - 1];
  return previous ? cleared.has(previous.id) : true;
}

function MissionCard({
  mission,
  index,
  unlocked,
  cleared,
  best,
  onSelect,
}: {
  mission: Mission;
  index: number;
  unlocked: boolean;
  cleared: boolean;
  best: number | null;
  onSelect: (mission: Mission) => void;
}) {
  const { t } = useApp();

  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={() => {
        sfx.play("select");
        onSelect(mission);
      }}
      className={[
        "pixel-btn focus-ring flex flex-col items-start gap-1.5 rounded-md p-3 text-left",
        unlocked
          ? "bg-[var(--panel)] hover:brightness-105"
          : "cursor-not-allowed bg-[var(--key-face)] opacity-60",
      ].join(" ")}
      aria-label={`${t("missions.level")} ${index + 1}: ${t(`missions.${mission.id}.title`)}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="font-retro text-[9px] text-[var(--ink-soft)]">
          {t("missions.level")} {index + 1}
        </span>
        <span className="text-lg leading-none" aria-hidden="true">
          {unlocked ? mission.badge : "🔒"}
        </span>
      </div>

      <h3
        className={[
          "text-sm font-bold leading-snug text-[var(--ink)]",
          mission.script === "kh" ? "font-khmer" : "",
        ].join(" ")}
      >
        {t(`missions.${mission.id}.title`)}
      </h3>

      <p className="text-[11px] leading-snug text-[var(--ink-soft)]">
        {t(`missions.${mission.id}.hint`)}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <span className="rounded-sm border-2 border-[var(--panel-edge)] bg-[var(--key-face)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--key-ink)]">
          {t(`missions.script.${mission.script}`)}
        </span>
        <span className="text-[9px] font-bold uppercase text-[var(--ink-soft)]">
          {t("missions.chars", { count: missionLength(mission) })}
        </span>
        <span className="text-[9px] font-bold uppercase text-[var(--ink-soft)]">
          {t("missions.targetWpm", { wpm: mission.targetWpm })}
        </span>
        {cleared ? (
          <span className="text-[9px] font-bold uppercase text-[var(--hit)]">
            ★ {best !== null ? `${best} ${t("hud.wpm")}` : ""}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function MissionSelect({
  cleared,
  bests,
  onSelect,
  onHelp,
}: {
  cleared: ReadonlySet<string>;
  bests: Readonly<Record<string, number>>;
  onSelect: (mission: Mission) => void;
  onHelp: () => void;
}) {
  const { t, isKhmer } = useApp();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className={[
              "text-[var(--ink)]",
              isKhmer
                ? "font-khmer text-base font-bold sm:text-lg"
                : "font-retro text-[12px] sm:text-[14px]",
            ].join(" ")}
          >
            {t("missions.heading")}
          </h2>
          <p
            className={[
              "mt-1 text-[var(--ink-soft)]",
              isKhmer ? "font-khmer text-xs leading-normal" : "text-[12px]",
            ].join(" ")}
          >
            {t("missions.sub")}
          </p>
        </div>
        {/* Second entry point: a first-time player lands here, not in the header. */}
        <PixelButton tone="coin" onClick={onHelp}>
          <span aria-hidden="true">? </span>
          {t("nav.help")}
        </PixelButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MISSIONS.map((mission, index) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={index}
            unlocked={isUnlocked(index, cleared)}
            cleared={cleared.has(mission.id)}
            best={bests[mission.id] ?? null}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
