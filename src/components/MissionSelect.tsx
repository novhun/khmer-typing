"use client";

/**
 * Level select. Built-in missions unlock in order, with the first mission of each script
 * always available. Also displays user-created and imported custom lessons.
 */

import type { MouseEvent } from "react";
import { useApp } from "@/context/AppProviders";
import { MISSIONS, missionLength, type Mission } from "@/lib/missions";
import { sfx } from "@/lib/sfx";
import { PixelButton } from "./PixelButton";

const ALWAYS_UNLOCKED = new Set(["kh-home-row", "en-home-row"]);

export function isUnlocked(index: number, cleared: ReadonlySet<string>): boolean {
  const mission = MISSIONS[index];
  if (!mission) return true;
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

function CustomMissionCard({
  mission,
  cleared,
  best,
  onSelect,
  onDelete,
}: {
  mission: Mission;
  cleared: boolean;
  best: number | null;
  onSelect: (mission: Mission) => void;
  onDelete: () => void;
}) {
  const { t } = useApp();

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (window.confirm(t("custom.deleteConfirm"))) {
      onDelete();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        sfx.play("select");
        onSelect(mission);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          sfx.play("select");
          onSelect(mission);
        }
      }}
      className="pixel-btn focus-ring relative flex flex-col items-start gap-1.5 rounded-md p-3 text-left bg-[var(--panel)] hover:brightness-105 cursor-pointer"
      aria-label={`Custom Lesson: ${mission.title || "Custom"}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="rounded-sm border border-[var(--panel-edge)] bg-[var(--coin)] px-1.5 py-0.5 font-retro text-[8px] uppercase text-[#7d3f14]">
          CUSTOM
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg leading-none" aria-hidden="true">
            {mission.badge}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            title={t("custom.delete")}
            aria-label={t("custom.delete")}
            className="rounded p-1 text-[11px] text-[var(--ink-soft)] hover:text-[var(--miss)] transition-colors"
          >
            🗑
          </button>
        </div>
      </div>

      <h3
        className={[
          "text-sm font-bold leading-snug text-[var(--ink)]",
          mission.script === "kh" ? "font-khmer" : "",
        ].join(" ")}
      >
        {mission.title || (mission.script === "kh" ? "មេរៀនផ្ទាល់ខ្លួន" : "Custom Lesson")}
      </h3>

      <p className="text-[11px] leading-snug text-[var(--ink-soft)] line-clamp-2">
        {mission.hint || `${mission.lines.length} lines · Custom exercise`}
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
    </div>
  );
}

export function MissionSelect({
  cleared,
  bests,
  customMissions = [],
  onSelect,
  onHelp,
  onCreateCustom,
  onDeleteCustom,
}: {
  cleared: ReadonlySet<string>;
  bests: Readonly<Record<string, number>>;
  customMissions?: Mission[];
  onSelect: (mission: Mission) => void;
  onHelp: () => void;
  onCreateCustom?: () => void;
  onDeleteCustom?: (id: string) => void;
}) {
  const { t } = useApp();

  return (
    <section className="flex flex-col gap-6">
      {/* Built-in missions heading & action bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-retro text-[12px] text-[var(--ink)] sm:text-[14px]">
              {t("missions.heading")}
            </h2>
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">{t("missions.sub")}</p>
          </div>
          <div className="flex items-center gap-2">
            {onCreateCustom && (
              <PixelButton tone="coin" onClick={onCreateCustom}>
                <span aria-hidden="true">+ </span>
                {t("custom.create")}
              </PixelButton>
            )}
            <PixelButton onClick={onHelp}>
              <span aria-hidden="true">? </span>
              {t("nav.help")}
            </PixelButton>
          </div>
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
      </div>

      {/* Custom Lessons Section */}
      <div className="flex flex-col gap-3 border-t-2 border-[var(--panel-edge)] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-retro text-[12px] text-[var(--ink)] sm:text-[14px]">
              {t("custom.heading")}
            </h3>
            <p className="mt-0.5 text-[11px] text-[var(--ink-soft)]">{t("custom.sub")}</p>
          </div>
          {onCreateCustom && (
            <PixelButton tone="primary" onClick={onCreateCustom}>
              <span aria-hidden="true">+ </span>
              {t("custom.createBtn")}
            </PixelButton>
          )}
        </div>

        {customMissions.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customMissions.map((mission) => (
              <CustomMissionCard
                key={mission.id}
                mission={mission}
                cleared={cleared.has(mission.id)}
                best={bests[mission.id] ?? null}
                onSelect={onSelect}
                onDelete={() => onDeleteCustom?.(mission.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--panel-edge)] p-6 text-center bg-[color-mix(in_srgb,var(--panel)_60%,transparent)]">
            <p className="text-xs font-semibold text-[var(--ink-soft)]">
              {t("custom.noCustomLessons")}
            </p>
            {onCreateCustom && (
              <PixelButton tone="coin" onClick={onCreateCustom} className="mt-1">
                <span aria-hidden="true">+ </span>
                {t("custom.create")}
              </PixelButton>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
