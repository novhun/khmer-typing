/**
 * Web Audio API synthesizer for Khmer Word Slicer.
 * Zero external audio files, ~0ms latency, pure synthesized arcade sound effects.
 */

class FruitSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fc:muted");
        this.muted = saved === "true";
      } catch {
        this.muted = false;
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fc:muted", String(this.muted));
      } catch {
        // ignore
      }
    }
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Swift blade whoosh sound */
  public playWhoosh(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Fast pitch sweep downwards to simulate whooshing air
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /** Juicy fruit splat impact sound */
  public playSplat(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Body thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);

    // High crunch/squelch
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(480, t + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(120, t + 0.1);

    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.setValueAtTime(0.08, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.02);
    osc2.stop(t + 0.11);
  }

  /** Combo chime: rising note pitch based on streak */
  public playCombo(combo: number): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    // Pentatonic scale base pitches
    const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const index = Math.min(Math.max(combo - 1, 0), baseFreqs.length - 1);
    const freq = baseFreqs[index];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.setValueAtTime(freq * 1.5, t + 0.05);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  /** Dull thud when a fruit falls and is missed */
  public playMiss(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /** Game start arcade fanfare */
  public playStart(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [
      { f: 440, dur: 0.08, at: 0 },
      { f: 554.37, dur: 0.08, at: 0.08 },
      { f: 659.25, dur: 0.16, at: 0.16 },
      { f: 880, dur: 0.28, at: 0.28 },
    ];

    const t0 = ctx.currentTime;
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(note.f, t0 + note.at);

      gain.gain.setValueAtTime(0.001, t0 + note.at);
      gain.gain.linearRampToValueAtTime(0.12, t0 + note.at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + note.at + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t0 + note.at);
      osc.stop(t0 + note.at + note.dur + 0.02);
    }
  }

  /** Game over descending arcade sequence */
  public playGameOver(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [
      { f: 440, dur: 0.16, at: 0 },
      { f: 415.3, dur: 0.16, at: 0.16 },
      { f: 370, dur: 0.2, at: 0.32 },
      { f: 293.66, dur: 0.45, at: 0.52 },
    ];

    const t0 = ctx.currentTime;
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(note.f, t0 + note.at);

      gain.gain.setValueAtTime(0.001, t0 + note.at);
      gain.gain.linearRampToValueAtTime(0.14, t0 + note.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + note.at + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t0 + note.at);
      osc.stop(t0 + note.at + note.dur + 0.02);
    }
  }
}

export const fruitSound = new FruitSoundEngine();
