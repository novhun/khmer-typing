"use client";

/** App bar: identity plus the language / theme / sound / help controls. */

import { useApp } from "@/context/AppProviders";
import { usePwa } from "@/context/PwaContext";
import { PixelButton } from "./PixelButton";

export function Header({ onHelp }: { onHelp: () => void }) {
  const { t, lang, toggleLang, theme, toggleTheme, soundOn, toggleSound } = useApp();
  const { isInstallable, installApp } = usePwa();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Question-mark block, straight out of a platformer. */}
        <div className="pixel-panel flex h-11 w-11 sm:h-12 sm:w-12 lg:h-13 lg:w-13 items-center justify-center rounded-[4px] bg-[var(--coin)] font-retro text-lg lg:text-xl text-[#7d3f14] shadow-sm">
          ?
        </div>
        <div>
          <h1 className="font-retro text-[13px] leading-tight text-[var(--ink)] sm:text-[17px] lg:text-[19px]">
            {t("app.title")}
          </h1>
          <p className="text-[11px] sm:text-[12px] font-semibold text-[var(--ink-soft)]">{t("app.subtitle")}</p>
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-2" aria-label={t("nav.language")}>
        {/* Language: the label always shows the language you would switch TO. */}
        <PixelButton
          tone="primary"
          onClick={toggleLang}
          aria-label={t("nav.switchTo")}
          title={t("nav.switchTo")}
        >
          <span className={lang === "en" ? "font-khmer" : ""}>
            {lang === "en" ? "ខ្មែរ" : "EN"}
          </span>
        </PixelButton>

        <PixelButton
          onClick={toggleTheme}
          aria-label={theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
          title={theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </PixelButton>

        <PixelButton
          onClick={toggleSound}
          aria-label={soundOn ? t("nav.soundOff") : t("nav.soundOn")}
          title={soundOn ? t("nav.soundOff") : t("nav.soundOn")}
          aria-pressed={soundOn}
        >
          {soundOn ? "🔊" : "🔇"}
        </PixelButton>

        {/* PWA Install Button */}
        {isInstallable && (
          <PixelButton
            tone="coin"
            onClick={installApp}
            aria-label={t("pwa.install")}
            title={t("pwa.installTitle")}
          >
            <span aria-hidden="true">⚡ </span>
            <span className="hidden sm:inline">{t("pwa.install")}</span>
          </PixelButton>
        )}

        {/* Labelled rather than a bare icon: the guide is the first thing a
            new learner needs, so it should not hide behind an "i". */}
        <PixelButton tone="coin" onClick={onHelp} aria-label={t("nav.help")} title={t("nav.help")}>
          <span aria-hidden="true">? </span>
          <span className="hidden sm:inline">{t("nav.help")}</span>
        </PixelButton>
      </nav>
    </header>
  );
}
