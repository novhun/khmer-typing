/**
 * localStorage helpers that never throw.
 *
 * Reading storage throws outright in Safari private mode and in embedded
 * webviews with site data disabled, so every access is guarded and falls back
 * to the supplied default. Callers can treat storage as best-effort.
 */

const PREFIX = "tq:";

export const STORAGE_KEYS = {
  lang: PREFIX + "lang",
  theme: PREFIX + "theme",
  sound: PREFIX + "sound",
  khmerLayout: PREFIX + "khmerLayout",
  cleared: PREFIX + "cleared",
  customMissions: PREFIX + "custom_missions",
  best: (missionId: string) => `${PREFIX}best:${missionId}`,
} as const;

export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota exceeded or storage disabled — progress is simply not persisted */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    writeStorage(key, JSON.stringify(value));
  } catch {
    /* unserialisable value — ignore */
  }
}
