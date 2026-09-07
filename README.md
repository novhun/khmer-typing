# Typing Quest — ដំណើរផ្សងព្រេងវាយអក្សរ

A Mario-style typing tutor for **Khmer and English**, built on the Next.js App Router.
Ten missions run from Khmer home-row consonants through coeng (sub-consonant) stacks to
English speed drills, with a live virtual keyboard, per-finger guidance, bilingual UI and
dark/light themes.

No image, audio or font files are bundled: every sprite is CSS, every sound is synthesised
with the Web Audio API, and the two webfonts are optional progressive enhancements.

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build (statically prerendered) and serve |
| `npm run build:check` | Same build into a throwaway `.next-check` — **use this while `npm run dev` is running** |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint 9 flat config (`eslint .`) |

> **Do not run `npm run build` while the dev server is up.** Both commands share `.next` by
> default, so a build overwrites the chunks the running dev server is serving and the live app
> dies with `Cannot find module './<id>.js'`. `next.config.mjs` honours a `NEXT_DIST_DIR` env
> var for exactly this reason; `npm run build:check` uses it to build somewhere harmless.

## Architecture

```
src/
  app/
    layout.tsx           Root layout + pre-hydration theme/language script
    page.tsx             Server Component; mounts the client island
    globals.css          Tailwind v4 entry, design tokens, retro chrome, keyframes
  context/
    AppProviders.tsx     Language + theme + sound context
  hooks/
    useTypingEngine.ts   The typing state machine (reducer + derived metrics)
  lib/
    khmer.ts             Khmer classification, orthographic cluster segmentation
    keyboard.ts          Physical key skeleton, layouts, finger map, char→key lookup
    missions.ts          Level definitions
    sfx.ts               Web Audio chiptune engine
    storage.ts           Fail-safe localStorage helpers
  lang/
    en.json, kh.json     Translation dictionaries
  components/
    TypingGame.tsx       Navigation + persisted progress (orchestrator)
    GameArena.tsx        Sky/ground/hero/Goombas, drill text, input capture
    VirtualKeyboard.tsx  Live key targeting, Shift hints, pressed-key mirroring
    HandGuide.tsx        Which finger to use
    Hud.tsx              Score, coins, lives, WPM/CPM, accuracy, progress
    NextKeyChip.tsx      Accessible "type this next" instruction
    MissionSelect.tsx    Level grid with unlock progression
    ResultOverlay.tsx    Win/lose summary
    GuideDialog.tsx      Tabbed in-app guide (see below)
    Header.tsx, PixelButton.tsx
```

## Three decisions worth knowing

**1. Code points for comparison, orthographic clusters for display.**
`Intl.Segmenter` is unusable for Khmer: U+17D2 COENG has the `Extend` property, so UAX #29
splits `ក្ក` into `["ក្", "ក"]`, tearing a consonant off its own subscript and rendering a
dotted circle. Worse, a grapheme cluster is the wrong *typing* unit — `ស្រុ` is four
keystrokes (ស + ្ + រ + ុ). So `khmer.ts` implements the Khmer cluster grammar
(`base (COENG base)* (vowel | sign)*`) for rendering, while the engine compares one code
point at a time. That split is why one engine drives both scripts with no branching on
script. Note the tight `isCombiningMark` bound: U+17D4–U+17DC (`។ ៕ ៖ ៗ ៛`) share the
Unicode block with combining marks but are standalone punctuation, and treating them as
marks glues `។` onto the previous syllable.

**2. TWO Khmer key tables, both extracted from the OS — four planes each.**
Cambodia uses two Khmer layouts in practice and they disagree on **82 of 192 key
positions**, so the app ships both and lets the learner choose (the `Key table` switch above
the keyboard; SBBIC is the default):

| | NiDA (shipped by macOS/Windows) | SBBIC (installed by hand) |
| --- | --- | --- |
| `ឯ` | Shift+`/` | **Option+E** |
| Space bar | space | **ZWSP** (the word divider) |
| Shift+Space | ZWSP | space |
| `ឫ` | Shift+A | Option+R |
| `€` | Option+5 | absent |
| Shift+Option row | typography (`~ … © ® ™`) | Khmer lunar dates (`᧠᧡᧢`) |

Both tables were dumped programmatically from this machine's installed input sources
(Carbon `UCKeyTranslate` over every virtual key across all four modifier planes), never
transcribed from a chart — hand-copied Khmer charts disagree on exactly the keys learners
need. Each key has **four** planes: base, Shift, Alt and Shift+Alt, where Alt is Option on
macOS and AltGr (often Ctrl+Alt) on Windows. The virtual keyboard prints all four, one per
corner.

That third plane is not decorative — it is where a Khmer layout keeps every Latin symbol,
because the base and Shift planes are full of Khmer: `$` is Option+4, `@` is Option+2, and
the Latin comma, full stop and question mark are Option chords. Other placements commonly
gotten wrong: `្` COENG is unshifted **J**, `ៃ` SARA AI is **Shift+S**, and `។` is **.**
with `៕` on **Shift+.**. `findKey()` searches planes easiest-chord-first, so a character
that exists unmodified is never taught as an Option chord.

Because the two tables do not offer the same characters, drill content is constrained to
their intersection: every checked-in mission is verified reachable on **both**, which is why
`ឨ` and `€` appear in none of them. If your layout differs, those two tables are the only
place to edit — the reverse lookup, finger guide, chord hints and key highlighting all
derive from them.

**3. Input is captured, not collected.**
A transparent `<textarea>` overlays the drill text; a **native** `beforeinput` listener
cancels the event and reads `event.data`. Native rather than React's `onBeforeInput` prop
because the latter is a legacy *synthesised* event whose `nativeEvent` carries no
`inputType` — and that field is what separates typing from pasting. Without the check, one
paste satisfies a whole drill and banks a meaningless WPM as a personal best. Only
`insertText`/`insertCompositionText` are accepted, each insertion length-capped, since no
key on any layout emits more than a couple of code points. Reading `event.data` (rather
than `keydown`) is also what makes multi-code-point keystrokes work at all.

## The in-app guide

The **How to play** button (header, and again on the mission screen) opens a five-tab guide:
*Basics*, *Khmer keyboard*, *Your stats*, *Fingers* and *Scoring* — fully translated in both
languages. It covers the rules, per-OS instructions for switching to the Khmer layout, a
definition for every HUD number, the finger colour legend and the exact scoring maths.

Its "keys everyone hunts for" cheat sheet — `្` on **J**, `ៃ` on **Shift+S**, ZWSP on
**Shift+Space**, `។` on **.** — is *generated* from `lib/keyboard.ts` through
`physicalKeyLabel()`, not typed out. A hard-coded cheat sheet would rot the moment the
layout table changed; this one cannot disagree with the key the game highlights, and the
same helper feeds the next-key chip.

## Behaviour notes

- **Mistakes do not advance the cursor.** The learner must type the correct key, as in any
  serious tutor; a fixed mistake is recorded as `corrected` — it still counts as a correct
  keystroke for accuracy, but earns fewer points and does not rebuild a combo.
- **Backspace un-awards** the character it removes, so retyping cannot farm coins.
- **WPM** uses the standard 5-characters-per-word convention; **CPM** is also shown, as it
  is the more honest figure for Khmer.
- **Unlocking** is sequential, except that the first mission of each script
  (`kh-home-row`, `en-home-row`) is always available.
- Progress, personal bests, language, theme and mute are persisted to `localStorage` under
  the `tq:` prefix, through helpers that swallow the exceptions Safari private mode throws.
- Theme and language are applied by a tiny pre-hydration script and then re-applied in a
  **layout** effect, so a Khmer or dark-mode user never sees a frame of English or a white
  flash.
- `prefers-reduced-motion: reduce` disables every animation while leaving the game fully
  playable.

## Accessibility

The virtual keyboard and drill text are `aria-hidden` decoration; the authoritative
instruction is `<NextKeyChip>`, which names the next character (including invisible ones
like COENG and ZWSP) in the active language inside a polite live region. The capture field
is a labelled `<textarea>`, Escape leaves a mission, `Tab` is deliberately left unhandled so
keyboard navigation still works, and the help modal uses native `<dialog>` for platform
focus trapping.

## Adding content

Add a mission to `MISSIONS` in `lib/missions.ts`, then add `missions.<id>.title` and
`missions.<id>.hint` to **both** `lang/en.json` and `lang/kh.json`. The dictionary is typed
as `Record<Lang, typeof en>`, so a missing Khmer key is a **compile error**, not an
`undefined` leaking into the UI.
