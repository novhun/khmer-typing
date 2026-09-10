"use client";

/**
 * Application-wide client state: language, theme and sound.
 *
 * Design notes
 * ------------
 * • Dictionaries are *statically imported*, not fetched. Switching language is a
 *   synchronous state update with no network round-trip and no loading state,
 *   and Next inlines the JSON into the client chunk.
 *
 * • `Record<Lang, Dict>` is typed against `en.json`, which makes an incomplete
 *   translation a BUILD ERROR rather than a runtime `undefined` leaking into the
 *   UI. Adding a key to en.json forces you to add it to kh.json.
 *
 * • Persisted preferences are applied in a layout effect (before the browser
 *   paints) instead of a passive effect, so a Khmer/dark-mode user never sees a
 *   frame of English or a white flash. The pre-hydration script in `layout.tsx`
 *   handles the `<html>` class for the same reason.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import en from "@/lang/en.json";
import kh from "@/lang/kh.json";
import {
  DEFAULT_KHMER_LAYOUT,
  KHMER_LAYOUTS,
  type KhmerLayoutId,
} from "@/lib/keyboard";
import { sfx } from "@/lib/sfx";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";
import { PwaProvider } from "./PwaContext";

/* ---------------------------------------------------------------------- *
 * Types
 * ---------------------------------------------------------------------- */

export type Lang = "en" | "kh";
export type Theme = "light" | "dark";

/** English is the canonical shape of a dictionary. */
type Dict = typeof en;

/** A translation may interpolate `{name}` placeholders. */
export type TranslateVars = Record<string, string | number>;
export type Translate = (key: string, vars?: TranslateVars) => string;

const DICTIONARIES: Record<Lang, Dict> = { en, kh };

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Translate a dot-path key, e.g. `t("hud.score")`. */
  t: Translate;
  /** True while Khmer is active — handy for switching font stacks. */
  isKhmer: boolean;

  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  soundOn: boolean;
  toggleSound: () => void;

  /**
   * Which Khmer key table to teach. Cambodia uses two in practice — the
   * OS-shipped NiDA layout and the SBBIC Khmer Unicode keyboard — and they
   * disagree on 82 of 192 key positions, so this cannot be assumed.
   */
  khmerLayout: KhmerLayoutId;
  setKhmerLayout: (layout: KhmerLayoutId) => void;

  /**
   * True on Apple platforms. Only affects *labels and key order* — the third
   * plane is reached with Option on macOS and AltGr on Windows/Linux, and the
   * bottom row is physically Ctrl-Option-Cmd rather than Ctrl-Win-Alt.
   */
  isMac: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ---------------------------------------------------------------------- *
 * Helpers
 * ---------------------------------------------------------------------- */

/** `useLayoutEffect` on the client, a no-op during SSR (avoids the React warning). */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Resolve a dot-separated path against a dictionary.
 * Returns the key itself when missing so gaps are obvious in the UI instead of
 * rendering "undefined".
 */
function resolve(dict: Dict, key: string): string {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : key;
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

const isLang = (value: string | null): value is Lang => value === "en" || value === "kh";

const isKhmerLayout = (value: string | null): value is KhmerLayoutId =>
  value !== null && (KHMER_LAYOUTS as string[]).includes(value);

/* ---------------------------------------------------------------------- *
 * Provider
 * ---------------------------------------------------------------------- */

export function AppProviders({
  children,
  defaultLang = "en",
  defaultTheme = "dark",
}: {
  children: ReactNode;
  defaultLang?: Lang;
  defaultTheme?: Theme;
}) {
  // First render must match the server markup exactly; stored values are picked
  // up in the layout effect below, before the first paint.
  const [lang, setLangState] = useState<Lang>(defaultLang);
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [soundOn, setSoundOn] = useState(true);
  // Detected after mount, never during render: reading `navigator` while
  // rendering would make the server and client markup disagree.
  const [isMac, setIsMac] = useState(false);
  const [khmerLayout, setKhmerLayoutState] = useState<KhmerLayoutId>(DEFAULT_KHMER_LAYOUT);

  useIsomorphicLayoutEffect(() => {
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const urlLang = urlParams ? urlParams.get("lang") : null;
    if (isLang(urlLang)) {
      setLangState(urlLang);
    } else {
      const storedLang = readStorage(STORAGE_KEYS.lang);
      if (isLang(storedLang)) setLangState(storedLang);
    }

    // The pre-hydration script already put the right class on <html>; trust it
    // so the toggle starts in the state the user is actually looking at.
    const urlTheme = urlParams?.get("theme");
    if (urlTheme === "light" || urlTheme === "dark") {
      setThemeState(urlTheme);
    } else {
      const domTheme: Theme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      setThemeState(domTheme);
    }

    const storedSound = readStorage(STORAGE_KEYS.sound);
    if (storedSound !== null) setSoundOn(storedSound === "on");

    // `navigator.platform` is deprecated, so sniff the UA. A wrong guess only
    // mislabels a modifier key; it never affects what input is accepted.
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));

    const storedLayout = readStorage(STORAGE_KEYS.khmerLayout);
    if (isKhmerLayout(storedLayout)) setKhmerLayoutState(storedLayout);
  }, []);

  // Keep <html lang>/<html class> and the sound engine in sync with state.
  useIsomorphicLayoutEffect(() => {
    document.documentElement.lang = lang === "kh" ? "km" : "en";
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    sfx.setMuted(!soundOn);
  }, [soundOn]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeStorage(STORAGE_KEYS.lang, next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStorage(STORAGE_KEYS.theme, next);
  }, []);

  const toggleLang = useCallback(
    () => setLang(lang === "en" ? "kh" : "en"),
    [lang, setLang],
  );

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  const setKhmerLayout = useCallback((next: KhmerLayoutId) => {
    setKhmerLayoutState(next);
    writeStorage(STORAGE_KEYS.khmerLayout, next);
    sfx.play("select");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      writeStorage(STORAGE_KEYS.sound, next ? "on" : "off");
      // Confirm the new state audibly, but only when turning sound ON.
      if (next) {
        sfx.setMuted(false);
        sfx.play("select");
      }
      return next;
    });
  }, []);

  // `t` is stable per language, so memoised children don't re-render on theme
  // or sound changes.
  const t = useMemo<Translate>(() => {
    const dict = DICTIONARIES[lang];
    return (key, vars) => interpolate(resolve(dict, key), vars);
  }, [lang]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      isKhmer: lang === "kh",
      theme,
      setTheme,
      toggleTheme,
      soundOn,
      toggleSound,
      isMac,
      khmerLayout,
      setKhmerLayout,
    }),
    [
      lang,
      setLang,
      toggleLang,
      t,
      theme,
      setTheme,
      toggleTheme,
      soundOn,
      toggleSound,
      isMac,
      khmerLayout,
      setKhmerLayout,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      <PwaProvider>{children}</PwaProvider>
    </AppContext.Provider>
  );
}

/* ---------------------------------------------------------------------- *
 * Hooks
 * ---------------------------------------------------------------------- */

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProviders>");
  return ctx;
}

/** Narrow hook for components that only translate. */
export function useTranslate(): Translate {
  return useApp().t;
}
