import type { AmbientSoundId } from "./ambientCatalog";
import { AMBIENT_CATALOG } from "./ambientCatalog";
import type { AmbientHandle } from "./ambientSound.types";

function fillNoiseBuffer(
  ctx: AudioContext,
  kind: "white" | "pink" | "brown",
): AudioBuffer {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (kind === "white") {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === "brown") {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      last = 0.98 * last + 0.02 * white;
      data[i] = last * 2.2;
    }
  }
  return buffer;
}

function loopNoise(
  ctx: AudioContext,
  buffer: AudioBuffer,
  destination: AudioNode,
): { start: () => void; stop: () => void } {
  let source: AudioBufferSourceNode | null = null;
  let playing = false;

  return {
    start() {
      if (playing) return;
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(destination);
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
  };
}

function buildBrownNoise(ctx: AudioContext, gain: GainNode, volume: number): AmbientHandle {
  const buffer = fillNoiseBuffer(ctx, "brown");
  const loop = loopNoise(ctx, buffer, gain);

  const handle: AmbientHandle = {
    start() {
      if (ctx.state === "suspended") void ctx.resume();
      loop.start();
    },
    stop: loop.stop,
    setVolume(v: number) {
      gain.gain.value = Math.max(0, Math.min(1, v)) * volume;
    },
    dispose() {
      loop.stop();
      void ctx.close();
    },
  };
  return handle;
}

function buildFanNoise(ctx: AudioContext, gain: GainNode, volume: number): AmbientHandle {
  const buffer = fillNoiseBuffer(ctx, "white");
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 310;
  filter.Q.value = 0.65;

  const hum = ctx.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 58;

  const humGain = ctx.createGain();
  humGain.gain.value = 0.018;

  hum.connect(humGain);
  humGain.connect(gain);

  const loop = loopNoise(ctx, buffer, filter);
  filter.connect(gain);

  let humStarted = false;

  return {
    start() {
      if (ctx.state === "suspended") void ctx.resume();
      loop.start();
      if (!humStarted) {
        hum.start();
        humStarted = true;
      }
    },
    stop() {
      loop.stop();
    },
    setVolume(v: number) {
      gain.gain.value = Math.max(0, Math.min(1, v)) * volume;
    },
    dispose() {
      loop.stop();
      try {
        hum.stop();
      } catch {
        /* ignore */
      }
      void ctx.close();
    },
  };
}

function buildCafeAmbience(ctx: AudioContext, gain: GainNode, volume: number): AmbientHandle {
  const base = fillNoiseBuffer(ctx, "pink");
  const baseFilter = ctx.createBiquadFilter();
  baseFilter.type = "lowpass";
  baseFilter.frequency.value = 900;

  const baseGain = ctx.createGain();
  baseGain.gain.value = 0.55;
  baseFilter.connect(baseGain);
  baseGain.connect(gain);

  const loop = loopNoise(ctx, base, baseFilter);

  let timer: number | null = null;
  let running = false;

  function burst() {
    if (!running) return;
    const burstGain = ctx.createGain();
    burstGain.gain.value = 0;
    burstGain.connect(gain);

    const noise = ctx.createBufferSource();
    noise.buffer = fillNoiseBuffer(ctx, "white");
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 600 + Math.random() * 1200;
    band.Q.value = 1.2;
    noise.connect(band);
    band.connect(burstGain);

    const now = ctx.currentTime;
    const peak = 0.04 + Math.random() * 0.05;
    burstGain.gain.setValueAtTime(0, now);
    burstGain.gain.linearRampToValueAtTime(peak, now + 0.08);
    burstGain.gain.exponentialRampToValueAtTime(
      0.001,
      now + 0.35 + Math.random() * 0.4,
    );

    noise.start(now);
    noise.stop(now + 1);

    timer = window.setTimeout(burst, 1800 + Math.random() * 4200);
  }

  return {
    start() {
      if (ctx.state === "suspended") void ctx.resume();
      running = true;
      loop.start();
      burst();
    },
    stop() {
      running = false;
      loop.stop();
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    },
    setVolume(v: number) {
      gain.gain.value = Math.max(0, Math.min(1, v)) * volume;
    },
    dispose() {
      this.stop();
      void ctx.close();
    },
  };
}

function buildAirportAmbience(
  ctx: AudioContext,
  gain: GainNode,
  volume: number,
): AmbientHandle {
  const rumble = fillNoiseBuffer(ctx, "brown");
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 180;

  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.75;
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(gain);

  const distant = fillNoiseBuffer(ctx, "pink");
  const distantFilter = ctx.createBiquadFilter();
  distantFilter.type = "bandpass";
  distantFilter.frequency.value = 420;
  distantFilter.Q.value = 0.4;

  const distantGain = ctx.createGain();
  distantGain.gain.value = 0.35;
  distantFilter.connect(distantGain);
  distantGain.connect(gain);

  const rumbleLoop = loopNoise(ctx, rumble, rumbleFilter);
  const distantLoop = loopNoise(ctx, distant, distantFilter);

  let timer: number | null = null;
  let running = false;

  function swell() {
    if (!running) return;
    const swellGain = ctx.createGain();
    swellGain.connect(gain);

    const noise = ctx.createBufferSource();
    noise.buffer = fillNoiseBuffer(ctx, "white");
    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 520;
    noise.connect(low);
    low.connect(swellGain);

    const now = ctx.currentTime;
    swellGain.gain.setValueAtTime(0, now);
    swellGain.gain.linearRampToValueAtTime(0.06, now + 1.2);
    swellGain.gain.linearRampToValueAtTime(0, now + 4.5);

    noise.start(now);
    noise.stop(now + 5);

    timer = window.setTimeout(swell, 8000 + Math.random() * 12000);
  }

  return {
    start() {
      if (ctx.state === "suspended") void ctx.resume();
      running = true;
      rumbleLoop.start();
      distantLoop.start();
      swell();
    },
    stop() {
      running = false;
      rumbleLoop.stop();
      distantLoop.stop();
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    },
    setVolume(v: number) {
      gain.gain.value = Math.max(0, Math.min(1, v)) * volume;
    },
    dispose() {
      this.stop();
      void ctx.close();
    },
  };
}

function buildClassicalAmbience(
  ctx: AudioContext,
  gain: GainNode,
  volume: number,
): AmbientHandle {
  const chords = [
    [261.63, 329.63, 392.0, 523.25],
    [220.0, 261.63, 329.63, 440.0],
    [196.0, 246.94, 293.66, 392.0],
    [174.61, 220.0, 261.63, 349.23],
  ];

  const masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = 2200;
  masterFilter.connect(gain);

  let interval: number | null = null;
  let running = false;
  let step = 0;

  function playNote(freq: number, when: number) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, when);
    noteGain.gain.linearRampToValueAtTime(0.045, when + 0.12);
    noteGain.gain.exponentialRampToValueAtTime(0.001, when + 2.8);

    osc.connect(noteGain);
    noteGain.connect(masterFilter);

    osc.start(when);
    osc.stop(when + 3);
  }

  function tick() {
    if (!running) return;
    const chord = chords[Math.floor(step / 4) % chords.length]!;
    const note = chord[step % chord.length]!;
    playNote(note, ctx.currentTime);
    step += 1;
    interval = window.setTimeout(tick, 620 + (step % 2) * 80);
  }

  return {
    start() {
      if (ctx.state === "suspended") void ctx.resume();
      running = true;
      tick();
    },
    stop() {
      running = false;
      if (interval !== null) {
        window.clearTimeout(interval);
        interval = null;
      }
    },
    setVolume(v: number) {
      gain.gain.value = Math.max(0, Math.min(1, v)) * volume;
    },
    dispose() {
      this.stop();
      void ctx.close();
    },
  };
}

export function createProceduralAmbient(
  id: AmbientSoundId,
  ctx: AudioContext,
  gain: GainNode,
): AmbientHandle {
  const { volume } = AMBIENT_CATALOG[id];

  switch (id) {
    case "brown":
      return buildBrownNoise(ctx, gain, volume);
    case "fan":
      return buildFanNoise(ctx, gain, volume);
    case "cafe":
      return buildCafeAmbience(ctx, gain, volume);
    case "airport":
      return buildAirportAmbience(ctx, gain, volume);
    case "classical":
      return buildClassicalAmbience(ctx, gain, volume);
    default:
      return buildBrownNoise(ctx, gain, volume);
  }
}
