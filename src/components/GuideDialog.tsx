"use client";

/**
 * The in-app guide: how to play, how to switch your computer to the Khmer
 * layout, what every HUD number means, finger colour coding, and the scoring
 * rules.
 *
 * Built on native <dialog> so focus trapping, Escape-to-close and top-layer
 * stacking come from the platform rather than hand-rolled JS.
 *
 * The "keys everyone hunts for" table is DERIVED from `lib/keyboard.ts` via
 * `physicalKeyLabel()` rather than typed out. A hard-coded cheat sheet would
 * silently rot the moment the layout table changed; this one cannot disagree
 * with the key the game highlights.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { useApp } from "@/context/AppProviders";
import { COENG, ZWJ, ZWSP, charNameKey, displayGlyph } from "@/lib/khmer";
import { FINGER_COLOR, FINGER_ORDER, physicalKeyLabel } from "@/lib/keyboard";
import { PixelButton } from "./PixelButton";

type TabId = "basics" | "keyboard" | "hud" | "fingers" | "scoring";

const TABS: TabId[] = ["basics", "keyboard", "hud", "fingers", "scoring"];

/** Sub-keys of `guide.basics.*` that carry a title/body pair, in reading order. */
const BASICS = ["goal", "mistake", "focus", "hints", "shortcuts"] as const;

/** Sub-keys of `guide.scoring.*`, in reading order. */
const SCORING = ["hit", "fix", "miss", "back", "combo", "lives", "unlock", "paste"] as const;

/** HUD fields, paired with their existing `hud.*` labels. */
const HUD_FIELDS = [
  "score",
  "coins",
  "lives",
  "wpm",
  "cpm",
  "accuracy",
  "combo",
  "errors",
  "time",
  "progress",
] as const;

/**
 * Characters learners cannot find on their own: the sub-consonant builder, the
 * two invisible ones, and the punctuation that shares keys with Latin marks.
 */
const NOTABLE_CHARS = [
  COENG,
  "ៃ",
  ZWSP,
  "។",
  "៕",
  "៖",
  "ៗ",
  "៛",
  "ំ",
  "់",
  "៉",
  // Option plane — the only way to reach these on a Khmer layout.
  "$",
  "€",
  "@",
  ",",
  ".",
  "?",
  "៑",
  "ៜ",
  ZWJ,
];

/* ---------------------------------------------------------------------- *
 * Shared bits
 * ---------------------------------------------------------------------- */

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-[3px] border-[var(--coin)] pl-3">
      <h4 className="text-sm font-bold text-[var(--ink)]">{title}</h4>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
      <span aria-hidden="true" className="text-[var(--coin)]">
        ▸
      </span>
      <span>{children}</span>
    </li>
  );
}

const KBD =
  "rounded border-2 border-[var(--panel-edge)] bg-[var(--key-face)] px-1.5 py-0.5 font-retro text-[9px] uppercase text-[var(--key-ink)]";

/** Renders a full chord, e.g. `Option + Shift + 1`. */
function KeyBadge({ label, shift, alt }: { label: string; shift: boolean; alt: boolean }) {
  const { t, isMac } = useApp();
  const parts = [
    alt ? (isMac ? t("keyboard.option") : t("keyboard.alt")) : null,
    shift ? t("keyboard.shift") : null,
    label === " " ? t("keyboard.space") : label,
  ].filter((x): x is string => Boolean(x));

  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 ? (
            <span aria-hidden="true" className="text-[var(--ink-soft)]">
              +
            </span>
          ) : null}
          <kbd className={KBD}>{part}</kbd>
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------------- *
 * Tab panels
 * ---------------------------------------------------------------------- */

function BasicsPanel() {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-[var(--ink-soft)]">{t("guide.basics.intro")}</p>
      {BASICS.map((key) => (
        <Section
          key={key}
          title={t(`guide.basics.${key}.title`)}
          body={t(`guide.basics.${key}.body`)}
        />
      ))}
    </div>
  );
}

function KeyboardPanel() {
  const { t, khmerLayout } = useApp();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">{t("guide.keyboard.intro")}</p>

      <Section
        title={t("guide.keyboard.twoLayouts.title")}
        body={t("guide.keyboard.twoLayouts.body")}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {(["macos", "windows"] as const).map((os) => (
          <div key={os} className="rounded-sm border-2 border-[var(--key-edge)] p-3">
            <h4 className="font-retro text-[10px] text-[var(--ink)]">
              {t(`guide.keyboard.${os}.title`)}
            </h4>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">
              {t(`guide.keyboard.${os}.body`)}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-bold text-[var(--ink)]">{t("guide.keyboard.keys.title")}</h4>
        <p className="mt-1 text-[12px] text-[var(--ink-soft)]">{t("guide.keyboard.keys.body")}</p>

        <ul className="mt-3 flex flex-col gap-1.5">
          {NOTABLE_CHARS.map((char) => {
            const hit = physicalKeyLabel(char, khmerLayout);
            const nameKey = charNameKey(char);
            return (
              <li
                key={char}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm bg-[var(--key-face)] px-2 py-1.5"
              >
                <span className="font-khmer w-8 text-center text-lg leading-none" aria-hidden="true">
                  {displayGlyph(char)}
                </span>
                {hit ? <KeyBadge label={hit.label} shift={hit.shift} alt={hit.alt} /> : null}
                {/* Only characters that need explaining get a name; `$` does not. */}
                {nameKey ? (
                  <span className="text-[12px] font-semibold text-[var(--ink)]">{t(nameKey)}</span>
                ) : null}
                {hit ? (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                    {t(`fingers.${hit.finger}`)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <Section
        title={t("guide.keyboard.altLayer.title")}
        body={t("guide.keyboard.altLayer.body")}
      />
      <Section title={t("guide.keyboard.order.title")} body={t("guide.keyboard.order.body")} />
    </div>
  );
}

function HudPanel() {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-semibold text-[var(--ink-soft)]">{t("guide.hud.intro")}</p>
      <dl className="flex flex-col gap-2">
        {HUD_FIELDS.map((field) => (
          <div
            key={field}
            className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3 border-b border-dashed border-[var(--key-edge)] pb-2"
          >
            <dt className="font-retro text-[9px] uppercase text-[var(--ink)]">{t(`hud.${field}`)}</dt>
            <dd className="text-[13px] leading-relaxed text-[var(--ink-soft)]">
              {t(`guide.hud.${field}`)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FingersPanel() {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">{t("guide.fingers.intro")}</p>
      <Section title={t("guide.fingers.home.title")} body={t("guide.fingers.home.body")} />
      <Section title={t("guide.fingers.colors.title")} body={t("guide.fingers.colors.body")} />

      {/* Legend: the same colours used on the keycaps and in the hand guide. */}
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {FINGER_ORDER.map((finger) => (
          <li key={finger} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3.5 w-6 rounded-sm border-2 border-[var(--panel-edge)]"
              style={{ background: FINGER_COLOR[finger] }}
            />
            <span className="text-[12px] font-semibold text-[var(--ink-soft)]">
              {t(`fingers.${finger}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoringPanel() {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-semibold text-[var(--ink-soft)]">{t("guide.scoring.intro")}</p>
      <ul className="flex flex-col gap-2">
        {SCORING.map((key) => (
          <Bullet key={key}>{t(`guide.scoring.${key}`)}</Bullet>
        ))}
      </ul>
    </div>
  );
}

const PANELS: Record<TabId, () => React.JSX.Element> = {
  basics: BasicsPanel,
  keyboard: KeyboardPanel,
  hud: HudPanel,
  fingers: FingersPanel,
  scoring: ScoringPanel,
};

/* ---------------------------------------------------------------------- *
 * Dialog
 * ---------------------------------------------------------------------- */

export function GuideDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<TabId>("basics");

  // Held in a ref so the native listener below can stay attached for the whole
  // lifetime of the dialog, even though the parent passes a fresh callback on
  // every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  /**
   * KEEPING REACT AUTHORITATIVE
   * ---------------------------
   * A <dialog> can close itself without telling React: Escape triggers the
   * platform's own close request. If that happens unheard, state desynchronises
   * — the dialog is shut while React still believes `open === true`, so the next
   * click on the Guide button calls `setOpen(true)`, changes nothing, triggers
   * no effect, and the button looks dead until it is clicked twice.
   *
   * Rather than *observing* the close (React's synthetic `onClose` is unreliable
   * because `close` does not bubble, and some environments never deliver the
   * event at all), we intercept the close request and route it through React:
   * `cancel` is prevented and turned into an `onClose()` call, so the dialog is
   * only ever really closed by the effect above. The `close` listener stays on
   * as a safety net for any path that still slips through.
   */
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
    };
    const handleClose = () => onCloseRef.current();

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  /** Escape, handled explicitly — the one path that does not depend on the
   *  platform delivering `cancel`/`close` to us. */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onClose();
  }, [onClose]);

  /**
   * Click-outside-to-close. A click on the ::backdrop is dispatched at the
   * dialog element itself; because the dialog has no padding, any click that
   * lands on children targets those children instead, so this cannot fire
   * accidentally from inside the panel.
   */
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  const Panel = PANELS[tab];

  return (
    <dialog
      ref={ref}
      aria-labelledby="guide-title"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      // `open:flex` — NOT a bare `flex`. Browsers hide a closed dialog with the
      // user-agent rule `dialog:not([open]) { display: none }`, and author CSS
      // always beats user-agent CSS regardless of specificity. An unconditional
      // `display: flex` therefore pins the dialog open forever: `close()` clears
      // the attribute, the element keeps rendering, and the close button looks
      // broken. Gating the utility on `[open]` lets the UA rule hide it again.
      className="pixel-panel m-auto max-h-[85dvh] w-[min(52rem,94vw)] lg:w-[min(60rem,90vw)] flex-col rounded-md p-0 text-[var(--ink)] open:flex backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-3 border-b-[3px] border-[var(--panel-edge)] p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="guide-title" className="font-retro text-[13px]">
              {t("guide.title")}
            </h2>
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">{t("guide.subtitle")}</p>
          </div>
          <PixelButton onClick={onClose} aria-label={t("guide.closeIcon")}>
            <span aria-hidden="true">✕</span>
          </PixelButton>
        </div>

        <div role="tablist" aria-label={t("guide.title")} className="flex flex-wrap gap-1.5">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={[
                "focus-ring rounded-sm border-2 border-[var(--panel-edge)] px-2 py-1 text-[11px] font-bold transition-colors",
                tab === id
                  ? "bg-[var(--coin)] text-[#1b1b2f]"
                  : "bg-[var(--key-face)] text-[var(--key-ink)] hover:brightness-105",
              ].join(" ")}
            >
              {t(`guide.tabs.${id}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Only the panel scrolls, so the tab strip stays reachable. */}
      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto p-4">
        <Panel />
      </div>

      <div className="flex justify-end border-t-[3px] border-[var(--panel-edge)] p-3">
        <PixelButton tone="coin" onClick={onClose} autoFocus>
          {t("guide.close")}
        </PixelButton>
      </div>
    </dialog>
  );
}
