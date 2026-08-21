/** Procedural brown noise via Web Audio — no external assets. */
export type NoiseHandle = {
  start: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  dispose: () => void;
};

export function createBrownNoise(): NoiseHandle | null {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const gain = ctx.createGain();
  gain.gain.value = 0.08;
  gain.connect(ctx.destination);

  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }

  let source: AudioBufferSourceNode | null = null;
  let playing = false;

  return {
    start() {
      if (playing) return;
      if (ctx.state === "suspended") void ctx.resume();
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      playing = true;
    },
    stop() {
      if (!playing || !source) return;
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      source.disconnect();
      source = null;
      playing = false;
    },
    setVolume(v: number) {
      gain.gain.value = Math.max(0, Math.min(1, v)) * 0.12;
    },
    dispose() {
      this.stop();
      void ctx.close();
    },
  };
}
