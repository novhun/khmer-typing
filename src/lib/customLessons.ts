/**
 * Custom lesson parsing, text chunking, and creation utilities.
 */

import { isKhmer, segmentClusters, toCodePoints } from "./khmer";
import type { Script } from "./keyboard";
import type { Mission } from "./missions";

/** Target line length in characters for optimal game arena display. */
export const TARGET_LINE_LENGTH = 45;
export const MAX_LINES_PER_LESSON = 20;

/**
 * Automatically detects whether text contains Khmer characters.
 */
export function detectScript(text: string): Script {
  const chars = toCodePoints(text);
  for (const ch of chars) {
    if (isKhmer(ch)) {
      return "kh";
    }
  }
  return "en";
}

/**
 * Splits a long line of text into bite-sized screens (~25-50 chars)
 * respecting Khmer orthographic clusters and word boundaries.
 */
function splitLongLine(line: string, maxLength = TARGET_LINE_LENGTH): string[] {
  const clusters = segmentClusters(line.trim());
  if (clusters.length === 0) return [];

  const chunks: string[] = [];
  let currentChunk = "";

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    const candidate = currentChunk + cluster.text;

    // Check if adding this cluster exceeds our target length
    if (candidate.length > maxLength && currentChunk.length >= 20) {
      // If the current cluster is a space or punctuation, or if current ends with one
      if (cluster.isSpace || cluster.text === " " || cluster.text === "​" || cluster.text === "។") {
        currentChunk += cluster.text;
        chunks.push(currentChunk.trim());
        currentChunk = "";
        continue;
      }

      // Try to find a recent break point within currentChunk
      const lastSpaceIndex = Math.max(
        currentChunk.lastIndexOf(" "),
        currentChunk.lastIndexOf("​"),
        currentChunk.lastIndexOf("។"),
      );

      if (lastSpaceIndex > 15) {
        const linePart = currentChunk.slice(0, lastSpaceIndex + 1).trim();
        const remainder = currentChunk.slice(lastSpaceIndex + 1);
        chunks.push(linePart);
        currentChunk = remainder + cluster.text;
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = cluster.text;
      }
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Parses multi-line or paragraph text into clean screens for the typing game.
 */
export function parseCustomLessonText(
  rawText: string,
  maxLength = TARGET_LINE_LENGTH,
): string[] {
  // 1. Split by explicit newlines
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return [];
  }

  const result: string[] = [];

  for (const line of rawLines) {
    if (line.length <= maxLength + 10) {
      result.push(line);
    } else {
      const subLines = splitLongLine(line, maxLength);
      result.push(...subLines);
    }

    if (result.length >= MAX_LINES_PER_LESSON) {
      break;
    }
  }

  return result.slice(0, MAX_LINES_PER_LESSON);
}

export interface CreateCustomMissionParams {
  id?: string;
  title: string;
  text: string;
  badge?: string;
  targetWpm?: number;
  script?: Script;
  hint?: string;
}

/**
 * Factory to create a fully validated Mission object from user text input.
 */
export function createCustomMission(params: CreateCustomMissionParams): Mission {
  const script = params.script ?? detectScript(params.text);
  const lines = parseCustomLessonText(params.text);

  if (lines.length === 0) {
    throw new Error("Lesson text cannot be empty.");
  }

  const id = params.id || `custom-${Date.now()}`;
  const badge = params.badge?.trim() || (script === "kh" ? "📝" : "⭐");
  const targetWpm = params.targetWpm ?? (script === "kh" ? 12 : 25);
  const title = params.title.trim() || (script === "kh" ? "មេរៀនផ្ទាល់ខ្លួន" : "Custom Lesson");
  const hint = params.hint?.trim() || `${lines.length} lines · Custom exercise`;

  return {
    id,
    script,
    badge,
    targetWpm,
    lines,
    title,
    hint,
    isCustom: true,
    createdAt: Date.now(),
  };
}

/**
 * Ready-to-use sample drills for quick testing.
 */
export const SAMPLE_LESSONS = {
  khmerProverbs: {
    title: "សុភាសិតខ្មែរ (Khmer Proverbs)",
    badge: "📜",
    script: "kh" as Script,
    targetWpm: 14,
    text: `ចេះពីរៀន មានពីរក
ស្ទូចត្រីស៊ីនុយ ធ្វើស្រែស៊ីទឹកភ្លៀង
ចំណេះជាទ្រព្យ គាប់ប្រសើរក្រៃ
ធ្វើល្អបានល្អ ធ្វើអាក្រក់បានអាក្រក់
ខំប្រឹងរៀនសូត្រ កុំខ្ជិលច្រអូស`,
  },
  englishPangrams: {
    title: "English Speed Pangrams",
    badge: "🚀",
    script: "en" as Script,
    targetWpm: 30,
    text: `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
Sphinx of black quartz, judge my vow.
Practice makes progress, never give up!`,
  },
};
