"use client";

/**
 * Crawlable, semantic Educational & SEO Guide.
 *
 * Provides Googlebot, Bingbot, and human learners with comprehensive
 * information on Khmer touch typing, NiDA keyboard conventions,
 * and frequently asked questions.
 */

import { useState } from "react";
import { useApp } from "@/context/AppProviders";
import { PixelButton } from "./PixelButton";

export function SeoGuide() {
  const { t, isKhmer } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      aria-labelledby="seo-heading"
      className="pixel-panel mt-6 flex flex-col gap-4 rounded-md p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="seo-heading"
            className={[
              "text-sm font-bold text-[var(--ink)] sm:text-base",
              isKhmer ? "font-khmer" : "font-retro text-[12px] sm:text-[14px]",
            ].join(" ")}
          >
            {t("seo.title")}
          </h2>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            {t("seo.subtitle")}
          </p>
        </div>
        <PixelButton
          tone="neutral"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="seo-content-body"
        >
          {isOpen ? t("seo.toggleHide") : t("seo.toggleShow")}
        </PixelButton>
      </div>

      {/* Crawlable content container */}
      <div
        id="seo-content-body"
        className={[
          "grid gap-6 transition-all duration-300",
          isOpen ? "block pt-2" : "hidden",
        ].join(" ")}
      >
        {/* Why Learn Touch Typing */}
        <article className="border-t border-[var(--pipe)] pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] sm:text-sm">
            {t("seo.whyKhmerTypingTitle")}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ink-soft)] sm:text-sm">
            {t("seo.whyKhmerTypingDesc")}
          </p>
        </article>

        {/* NiDA Keyboard Layout */}
        <article className="border-t border-[var(--pipe)] pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] sm:text-sm">
            {t("seo.keyboardLayoutTitle")}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ink-soft)] sm:text-sm">
            {t("seo.keyboardLayoutDesc")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded bg-[var(--key-face)] px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--key-ink)]">
              Home Row: ា ស ដ ថ ង ហ ក ល
            </span>
            <span className="rounded bg-[var(--key-face)] px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--key-ink)]">
              Subscript Coeng (ជើង): J Key
            </span>
            <span className="rounded bg-[var(--key-face)] px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--key-ink)]">
              Sara AI (ៃ): Shift + S
            </span>
            <span className="rounded bg-[var(--key-face)] px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--key-ink)]">
              ZWSP Divider: Shift + Space
            </span>
          </div>
        </article>

        {/* FAQ Accordion */}
        <article className="border-t border-[var(--pipe)] pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] sm:text-sm">
            {t("seo.faqTitle")}
          </h3>

          <div className="mt-3 divide-y divide-[var(--pipe)]">
            <details className="group py-3 text-xs sm:text-sm">
              <summary className="cursor-pointer font-semibold text-[var(--ink)] transition-colors hover:text-[var(--coin)]">
                {t("seo.faq1Q")}
              </summary>
              <p className="mt-2 pl-3 text-[var(--ink-soft)]">
                {t("seo.faq1A")}
              </p>
            </details>

            <details className="group py-3 text-xs sm:text-sm">
              <summary className="cursor-pointer font-semibold text-[var(--ink)] transition-colors hover:text-[var(--coin)]">
                {t("seo.faq2Q")}
              </summary>
              <p className="mt-2 pl-3 text-[var(--ink-soft)]">
                {t("seo.faq2A")}
              </p>
            </details>

            <details className="group py-3 text-xs sm:text-sm">
              <summary className="cursor-pointer font-semibold text-[var(--ink)] transition-colors hover:text-[var(--coin)]">
                {t("seo.faq3Q")}
              </summary>
              <p className="mt-2 pl-3 text-[var(--ink-soft)]">
                {t("seo.faq3A")}
              </p>
            </details>

            <details className="group py-3 text-xs sm:text-sm">
              <summary className="cursor-pointer font-semibold text-[var(--ink)] transition-colors hover:text-[var(--coin)]">
                {t("seo.faq4Q")}
              </summary>
              <p className="mt-2 pl-3 text-[var(--ink-soft)]">
                {t("seo.faq4A")}
              </p>
            </details>
          </div>
        </article>
      </div>
    </section>
  );
}
