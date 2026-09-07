"use client";

/**
 * Custom Lesson Creation & Text/File Import Dialog.
 *
 * Allows players to:
 * - Type or paste arbitrary text in Khmer or English
 * - Import text from `.txt` files
 * - Choose lesson title, emoji badge, and target WPM
 * - Automatically slice text into game-friendly screens/lines
 * - Preview the parsed screens before saving or playing
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { useApp } from "@/context/AppProviders";
import {
  createCustomMission,
  detectScript,
  parseCustomLessonText,
  SAMPLE_LESSONS,
} from "@/lib/customLessons";
import { toCodePoints } from "@/lib/khmer";
import type { Mission } from "@/lib/missions";
import { PixelButton } from "./PixelButton";

const BADGE_OPTIONS = ["📝", "📜", "🎯", "🚀", "⭐", "🍄", "⚡", "🏆", "💡", "🌿"];

interface CustomLessonDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (mission: Mission, andPlay?: boolean) => void;
}

export function CustomLessonDialog({
  open,
  onClose,
  onSave,
}: CustomLessonDialogProps) {
  const { t } = useApp();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [badge, setBadge] = useState("📝");
  const [targetWpm, setTargetWpm] = useState(15);
  const [error, setError] = useState<string | null>(null);

  // Sync open state with native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      setError(null);
    }
  }, [open]);

  // Handle backdrop clicks to dismiss
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  // Derived parsing preview
  const detectedScript = useMemo(() => detectScript(text), [text]);
  const parsedLines = useMemo(() => parseCustomLessonText(text), [text]);
  const totalChars = useMemo(() => toCodePoints(text).length, [text]);

  // Set default target WPM based on detected script when text changes
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = e.target.value;
    setText(nextText);
    setError(null);
    if (!text && nextText) {
      const script = detectScript(nextText);
      setTargetWpm(script === "kh" ? 14 : 28);
    }
  };

  // Import .txt file
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use file name (without extension) as default title if empty
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    if (!title.trim()) {
      setTitle(fileName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setText(content);
        const script = detectScript(content);
        setTargetWpm(script === "kh" ? 14 : 28);
        setError(null);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = "";
  };

  // Load sample presets
  const handleLoadSample = (sample: typeof SAMPLE_LESSONS.khmerProverbs) => {
    setTitle(sample.title);
    setText(sample.text);
    setBadge(sample.badge);
    setTargetWpm(sample.targetWpm);
    setError(null);
  };

  // Validation and submit
  const handleSubmit = (andPlay = false) => {
    if (!text.trim() || parsedLines.length === 0) {
      setError(t("custom.emptyWarning"));
      return;
    }

    try {
      const mission = createCustomMission({
        title: title.trim() || (detectedScript === "kh" ? "មេរៀនផ្ទាល់ខ្លួន" : "Custom Lesson"),
        text,
        badge,
        targetWpm,
        script: detectedScript,
      });

      onSave(mission, andPlay);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating lesson");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="custom-lesson-title"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="pixel-panel m-auto max-h-[88dvh] w-[min(48rem,94vw)] flex-col rounded-md p-0 text-[var(--ink)] open:flex backdrop:bg-black/60"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 border-b-[3px] border-[var(--panel-edge)] p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="custom-lesson-title" className="font-retro text-[13px] sm:text-[15px]">
              {t("custom.dialogTitle")}
            </h2>
            <p className="mt-1 text-[11px] text-[var(--ink-soft)] sm:text-[12px]">
              {t("custom.dialogSub")}
            </p>
          </div>
          <PixelButton onClick={onClose} aria-label={t("guide.closeIcon")}>
            <span aria-hidden="true">✕</span>
          </PixelButton>
        </div>

        {/* Quick Sample & Import Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,text/plain"
            className="hidden"
          />
          <PixelButton
            tone="primary"
            onClick={() => fileInputRef.current?.click()}
            title={t("custom.importFile")}
          >
            <span aria-hidden="true">📂 </span>
            {t("custom.importFile")}
          </PixelButton>

          <PixelButton
            onClick={() => handleLoadSample(SAMPLE_LESSONS.khmerProverbs)}
            title={t("custom.loadSampleKh")}
          >
            <span aria-hidden="true">📜 </span>
            {t("custom.loadSampleKh")}
          </PixelButton>

          <PixelButton
            onClick={() => handleLoadSample(SAMPLE_LESSONS.englishPangrams)}
            title={t("custom.loadSampleEn")}
          >
            <span aria-hidden="true">🚀 </span>
            {t("custom.loadSampleEn")}
          </PixelButton>
        </div>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="rounded border-2 border-[var(--miss)] bg-[color-mix(in_srgb,var(--miss)_18%,transparent)] p-2.5 text-xs text-[var(--miss)]">
            ⚠️ {error}
          </div>
        )}

        {/* Title & Badge */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-3">
            <label
              htmlFor="custom-title"
              className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] mb-1"
            >
              {t("custom.titleLabel")}
            </label>
            <input
              id="custom-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("custom.titlePlaceholder")}
              className="w-full rounded border-2 border-[var(--panel-edge)] bg-[var(--key-face)] p-2 text-xs font-semibold text-[var(--key-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--coin)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              {t("custom.badgeLabel")}
            </label>
            <div className="flex flex-wrap gap-1">
              {BADGE_OPTIONS.slice(0, 5).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setBadge(emoji)}
                  className={[
                    "h-8 w-8 rounded border-2 text-sm transition-transform",
                    badge === emoji
                      ? "border-[var(--coin)] bg-[var(--coin)] scale-110"
                      : "border-[var(--panel-edge)] bg-[var(--key-face)] hover:brightness-105",
                  ].join(" ")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drill Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="custom-text"
              className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]"
            >
              {t("custom.textLabel")}
            </label>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-[var(--ink-soft)]">
              <span className="rounded bg-[var(--key-face)] px-1.5 py-0.5 uppercase text-[var(--key-ink)] border border-[var(--panel-edge)]">
                {t(`missions.script.${detectedScript}`)}
              </span>
              <span>{t("custom.charsCount", { count: totalChars })}</span>
            </div>
          </div>
          <textarea
            id="custom-text"
            rows={5}
            value={text}
            onChange={handleTextChange}
            placeholder={t("custom.textPlaceholder")}
            className="w-full rounded border-2 border-[var(--panel-edge)] bg-[var(--key-face)] p-2.5 text-xs text-[var(--key-ink)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--coin)]"
          />
        </div>

        {/* Target WPM */}
        <div>
          <label
            htmlFor="custom-wpm"
            className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] mb-1"
          >
            <span>{t("custom.targetWpmLabel")}</span>
            <span className="font-mono text-[var(--coin)] text-xs">
              {targetWpm} {t("hud.wpm")}
            </span>
          </label>
          <input
            id="custom-wpm"
            type="range"
            min={8}
            max={60}
            step={2}
            value={targetWpm}
            onChange={(e) => setTargetWpm(Number(e.target.value))}
            className="w-full accent-[var(--coin)]"
          />
        </div>

        {/* Live Line-by-Line Preview */}
        {parsedLines.length > 0 && (
          <div className="rounded border-2 border-[var(--panel-edge)] bg-[var(--key-face)] p-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--ink-soft)] mb-2">
              <span>{t("custom.linesPreview", { count: parsedLines.length })}</span>
              <span>Screens in Arena</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {parsedLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-baseline gap-2 rounded bg-[var(--panel)] p-1.5 text-xs border border-[var(--panel-edge)]"
                >
                  <span className="font-mono text-[9px] font-bold text-[var(--coin)] shrink-0">
                    #{idx + 1}
                  </span>
                  <span
                    className={[
                      "break-all text-[var(--ink)]",
                      detectedScript === "kh" ? "font-khmer leading-relaxed" : "font-mono",
                    ].join(" ")}
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t-[3px] border-[var(--panel-edge)] p-3">
        <PixelButton onClick={onClose}>{t("custom.cancel")}</PixelButton>
        <div className="flex items-center gap-2">
          <PixelButton tone="coin" onClick={() => handleSubmit(false)}>
            {t("custom.saveOnly")}
          </PixelButton>
          <PixelButton tone="primary" onClick={() => handleSubmit(true)}>
            <span aria-hidden="true">▶ </span>
            {t("custom.saveAndPlay")}
          </PixelButton>
        </div>
      </div>
    </dialog>
  );
}
