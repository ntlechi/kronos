import type { AmbientHandle } from "./ambientSound.types";

export async function fetchAmbientBuffer(
  ctx: AudioContext,
  urls: readonly string[],
): Promise<AudioBuffer | null> {
  for (const url of urls) {
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (!head.ok) continue;

      const res = await fetch(url);
      if (!res.ok) continue;

      const bytes = await res.arrayBuffer();
      return await ctx.decodeAudioData(bytes.slice(0));
    } catch {
      /* try next format / path */
    }
  }
  return null;
}

export function createFileAmbient(
  ctx: AudioContext,
  buffer: AudioBuffer,
  gain: GainNode,
  volumeMultiplier: number,
): AmbientHandle {
  let source: AudioBufferSourceNode | null = null;
  let playing = false;
  let level = 1;

  function applyVolume() {
    gain.gain.value = Math.max(0, Math.min(1, level)) * volumeMultiplier;
  }

  applyVolume();

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
      level = v;
      applyVolume();
    },
    dispose() {
      this.stop();
      void ctx.close();
    },
  };
}
