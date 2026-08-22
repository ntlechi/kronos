/**
 * Focus Runner ambience — CC0 file loops in `public/audio/ambient/` override
 * procedural synth when present. No code changes needed after drop-in.
 */

import {
  AMBIENT_CATALOG,
  AMBIENT_SOUND_IDS,
  ambientFilesFor,
  type AmbientCatalogEntry,
  type AmbientSoundId,
  type AmbientSourceKind,
} from "./ambientCatalog";
import { createFileAmbient, fetchAmbientBuffer } from "./fileAmbient";
import { createProceduralAmbient } from "./proceduralAmbient";
import type { AmbientHandle } from "./ambientSound.types";

export type { AmbientHandle } from "./ambientSound.types";
export type {
  AmbientCatalogEntry,
  AmbientSoundId,
  AmbientSourceKind,
} from "./ambientCatalog";
export {
  AMBIENT_BASE_PATH,
  AMBIENT_CATALOG,
  AMBIENT_SOUND_IDS,
  ambientFilesFor,
} from "./ambientCatalog";

const STORAGE_KEY = "kronos-focus-ambient";

type ResolvedAmbient = {
  handle: AmbientHandle;
  kind: AmbientSourceKind;
};

const resolveCache = new Map<AmbientSoundId, Promise<ResolvedAmbient>>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

async function resolveAmbientSound(id: AmbientSoundId): Promise<ResolvedAmbient> {
  const ctx = getAudioContext();
  if (!ctx) {
    throw new Error("Web Audio unavailable");
  }

  const entry = AMBIENT_CATALOG[id];
  const gain = ctx.createGain();
  gain.gain.value = entry.volume;
  gain.connect(ctx.destination);

  const buffer = await fetchAmbientBuffer(ctx, entry.files);
  if (buffer) {
    return {
      kind: "file",
      handle: createFileAmbient(ctx, buffer, gain, entry.volume),
    };
  }

  return {
    kind: "procedural",
    handle: createProceduralAmbient(id, ctx, gain),
  };
}

function getResolved(id: AmbientSoundId): Promise<ResolvedAmbient> {
  let pending = resolveCache.get(id);
  if (!pending) {
    pending = resolveAmbientSound(id);
    resolveCache.set(id, pending);
  }
  return pending;
}

/** Warm the cache for a sound (optional — e.g. on Focus page mount). */
export function preloadAmbientSound(id: AmbientSoundId): void {
  void getResolved(id);
}

/** Which backend is active once assets are resolved (file wins when present). */
export async function getAmbientSourceKind(
  id: AmbientSoundId,
): Promise<AmbientSourceKind> {
  const resolved = await getResolved(id);
  return resolved.kind;
}

export function loadAmbientPreference(): AmbientSoundId {
  if (typeof window === "undefined") return "brown";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && AMBIENT_SOUND_IDS.includes(raw as AmbientSoundId)) {
      return raw as AmbientSoundId;
    }
  } catch {
    /* ignore */
  }
  return "brown";
}

export function saveAmbientPreference(id: AmbientSoundId) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

function createLazyAmbient(id: AmbientSoundId): AmbientHandle | null {
  if (typeof window === "undefined") return null;

  let inner: AmbientHandle | null = null;
  let pendingStart = false;
  let level = 1;
  let disposed = false;

  const wrapper: AmbientHandle = {
    start() {
      if (disposed) return;
      if (inner) {
        inner.start();
        return;
      }
      pendingStart = true;
    },
    stop() {
      pendingStart = false;
      inner?.stop();
    },
    setVolume(v: number) {
      level = v;
      inner?.setVolume(v);
    },
    dispose() {
      disposed = true;
      pendingStart = false;
      inner?.dispose();
      inner = null;
      resolveCache.delete(id);
    },
  };

  void getResolved(id)
    .then(({ handle }) => {
      if (disposed) {
        handle.dispose();
        return;
      }
      inner = handle;
      inner.setVolume(level);
      if (pendingStart) inner.start();
    })
    .catch(() => {
      if (disposed) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      inner = createProceduralAmbient(id, ctx, gain);
      inner.setVolume(level);
      if (pendingStart) inner.start();
    });

  return wrapper;
}

export function createAmbientSound(id: AmbientSoundId): AmbientHandle | null {
  return createLazyAmbient(id);
}

/** @deprecated Use createAmbientSound("brown") */
export type NoiseHandle = AmbientHandle;

/** @deprecated Use createAmbientSound */
export function createBrownNoise(): AmbientHandle | null {
  return createAmbientSound("brown");
}
