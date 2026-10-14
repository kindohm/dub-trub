type Preferences = { beat: boolean; effects: boolean };
const STORAGE_KEY = "double-trouble-audio";

/** Small acoustic-inspired instruments, synthesized locally without downloaded assets. */
export class GameAudio {
  readonly preferences: Preferences = { beat: true, effects: true };
  private context?: AudioContext;
  private beatGain?: GainNode;
  private effectsGain?: GainNode;
  private timer?: number;
  private nextBeat = 0;
  private step = 0;
  private playing = false;
  private visible = true;

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      for (const key of ["beat", "effects"] as const)
        if (typeof saved?.[key] === "boolean")
          this.preferences[key] = saved[key];
    } catch {
      /* Storage can be unavailable; audio still works. */
    }
  }

  unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        const limiter = this.context.createDynamicsCompressor();
        limiter.threshold.value = -18;
        limiter.ratio.value = 8;
        limiter.connect(this.context.destination);
        this.beatGain = this.context.createGain();
        this.effectsGain = this.context.createGain();
        this.beatGain.connect(limiter);
        this.effectsGain.connect(limiter);
      }
      void this.context
        .resume()
        .then(() => this.sync())
        .catch(() => {});
    } catch {
      /* Unsupported audio must not prevent play. */
    }
  }

  setPreference(key: keyof Preferences, enabled: boolean) {
    this.preferences[key] = enabled;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch {
      /* Optional persistence. */
    }
    this.unlock();
    this.sync();
  }

  setPlaying(playing: boolean, visible: boolean) {
    this.playing = playing;
    this.visible = visible;
    this.sync();
  }

  private sync() {
    const ctx = this.context;
    if (!ctx) return;
    const active = this.playing && this.visible && this.preferences.beat;
    this.beatGain!.gain.setTargetAtTime(
      active ? 0.22 : 0,
      ctx.currentTime,
      0.01,
    );
    this.effectsGain!.gain.setTargetAtTime(
      this.visible && this.preferences.effects ? 0.55 : 0,
      ctx.currentTime,
      0.01,
    );
    if (!active || ctx.state !== "running") {
      window.clearInterval(this.timer);
      this.timer = undefined;
    } else if (this.timer === undefined) {
      this.nextBeat = ctx.currentTime + 0.03;
      this.step = 0;
      this.schedule();
      this.timer = window.setInterval(() => this.schedule(), 25);
    }
  }

  private tone(
    frequency: number,
    time: number,
    duration: number,
    volume: number,
    output: AudioNode,
    fall = 1,
  ) {
    const ctx = this.context!;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * fall,
      time + duration,
    );
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + 0.003);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope).connect(output);
    oscillator.start(time);
    oscillator.stop(time + duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  private shaker(time: number, accent: boolean) {
    const ctx = this.context!;
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * 0.055),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.18));
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 3500;
    gain.gain.value = accent ? 0.25 : 0.12;
    source.connect(filter).connect(gain).connect(this.beatGain!);
    source.start(time);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  private schedule() {
    const ctx = this.context!;
    if (this.nextBeat < ctx.currentTime) this.nextBeat = ctx.currentTime + 0.03;
    while (this.nextBeat < ctx.currentTime + 0.1) {
      this.shaker(this.nextBeat, this.step % 2 === 0);
      if (this.step % 4 === 0)
        this.tone(130, this.nextBeat, 0.18, 0.65, this.beatGain!, 0.45);
      if (this.step % 4 === 2)
        this.tone(230, this.nextBeat, 0.1, 0.35, this.beatGain!, 0.65);
      this.step = (this.step + 1) % 8;
      this.nextBeat += 60 / 100 / 2;
    }
  }

  effect(kind: "tap" | "invalid" | "pair", count = 1) {
    if (
      !this.context ||
      this.context.state !== "running" ||
      !this.preferences.effects ||
      !this.visible
    )
      return;
    const time = this.context.currentTime;
    const out = this.effectsGain!;
    if (kind === "tap") {
      this.tone(680, time, 0.065, 0.35, out, 0.8);
      this.tone(1130, time, 0.025, 0.12, out);
    } else if (kind === "invalid") {
      this.tone(170, time, 0.15, 0.5, out, 0.5);
    } else {
      for (let i = 0; i < count; i++) {
        for (const [offset, frequency] of [
          [0, 523.25],
          [0.09, 783.99],
        ]) {
          const at = time + i * 0.025 + offset;
          this.tone(frequency, at, 0.32, 0.35 / Math.sqrt(count), out);
          this.tone(frequency * 4, at, 0.055, 0.08 / Math.sqrt(count), out);
        }
      }
    }
  }
}
