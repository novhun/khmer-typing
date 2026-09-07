/**
 * Chiptune sound effects synthesised with the Web Audio API.
 *
 * No audio files: every sound is a few oscillator ramps, which keeps the bundle
 * at zero extra bytes and the latency at ~0ms (important — a typing game plays a
 * sound on every keystroke).
 *
 * The AudioContext is created lazily on the first `play()` because browsers
 * refuse to start one before a user gesture; the first keystroke is that gesture.
 */

export type SoundName = "jump" | "coin" | "bump" | "win" | "lose" | "levelup" | "select" | "diamond";

interface Note {
  /** Frequency in Hz. */
  f: number;
  /** Start offset in seconds, relative to the trigger. */
  at: number;
  /** Duration in seconds. */
  dur: number;
  type?: OscillatorType;
  gain?: number;
  /** Optional glide target frequency. */
  to?: number;
}

/** Retro voicing: square waves for melody, triangle for thuds. */
const PATCHES: Record<SoundName, Note[]> = {
  jump: [{ f: 380, to: 760, at: 0, dur: 0.09, type: "square", gain: 0.16 }],
  coin: [
    { f: 988, at: 0, dur: 0.06, type: "square", gain: 0.14 },
    { f: 1319, at: 0.055, dur: 0.11, type: "square", gain: 0.14 },
  ],
  diamond: [
    { f: 1319, at: 0, dur: 0.045, type: "square", gain: 0.13 },
    { f: 1760, at: 0.04, dur: 0.06, type: "square", gain: 0.15 },
    { f: 2093, at: 0.09, dur: 0.07, type: "sine", gain: 0.16 },
    { f: 2637, at: 0.15, dur: 0.14, type: "triangle", gain: 0.15 },
  ],
  bump: [{ f: 190, to: 90, at: 0, dur: 0.14, type: "triangle", gain: 0.26 }],
  select: [{ f: 660, at: 0, dur: 0.05, type: "square", gain: 0.12 }],
  levelup: [
    { f: 523, at: 0, dur: 0.08, type: "square", gain: 0.13 },
    { f: 659, at: 0.08, dur: 0.08, type: "square", gain: 0.13 },
    { f: 784, at: 0.16, dur: 0.12, type: "square", gain: 0.13 },
  ],
  win: [
    { f: 523, at: 0, dur: 0.1, type: "square", gain: 0.14 },
    { f: 659, at: 0.1, dur: 0.1, type: "square", gain: 0.14 },
    { f: 784, at: 0.2, dur: 0.1, type: "square", gain: 0.14 },
    { f: 1047, at: 0.3, dur: 0.26, type: "square", gain: 0.15 },
  ],
  lose: [
    { f: 392, at: 0, dur: 0.12, type: "square", gain: 0.14 },
    { f: 311, at: 0.12, dur: 0.12, type: "square", gain: 0.14 },
    { f: 233, at: 0.24, dur: 0.3, type: "triangle", gain: 0.16 },
  ],
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /** Fire and forget. Silently no-ops when muted or unsupported. */
  play(name: SoundName): void {
    if (this.muted || typeof window === "undefined") return;

    const ctx = this.ensureContext();
    if (!ctx) return;
    // Autoplay policies suspend the context until a gesture resumes it.
    if (ctx.state === "suspended") void ctx.resume();

    const t0 = ctx.currentTime;
    for (const note of PATCHES[name]) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const start = t0 + note.at;
      const end = start + note.dur;

      osc.type = note.type ?? "square";
      osc.frequency.setValueAtTime(note.f, start);
      if (note.to !== undefined) osc.frequency.exponentialRampToValueAtTime(note.to, end);

      // Percussive envelope; exponential release avoids clicks.
      const peak = note.gain ?? 0.15;
      amp.gain.setValueAtTime(0.0001, start);
      amp.gain.exponentialRampToValueAtTime(peak, start + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(amp).connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch {
      return null;
    }
    return this.ctx;
  }
}

/** Module-level singleton: one AudioContext per tab is the documented budget. */
export const sfx = new SoundEngine();
