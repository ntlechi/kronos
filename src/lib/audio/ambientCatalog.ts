/** CC0 loop drop-in paths (under `public/`). Procedural synth used until a file exists. */

export const AMBIENT_SOUND_IDS = [
  "brown",
  "cafe",
  "airport",
  "fan",
  "classical",
] as const;

export type AmbientSoundId = (typeof AMBIENT_SOUND_IDS)[number];

export type AmbientCatalogEntry = {
  id: AmbientSoundId;
  /** Tried in order; first reachable file wins. Prefer `.ogg` for size. */
  files: readonly string[];
  /** Master gain multiplier when playing (0–1 scale input). */
  volume: number;
  /** Guidance when sourcing a CC0 replacement loop. */
  assetHint: string;
};

export const AMBIENT_BASE_PATH = "/audio/ambient";

export const AMBIENT_CATALOG: Record<AmbientSoundId, AmbientCatalogEntry> = {
  brown: {
    id: "brown",
    files: [`${AMBIENT_BASE_PATH}/brown.ogg`, `${AMBIENT_BASE_PATH}/brown.mp3`],
    volume: 0.12,
    assetHint:
      "Seamless brown / red noise loop, 30–90s. Procedural fallback is already strong.",
  },
  cafe: {
    id: "cafe",
    files: [`${AMBIENT_BASE_PATH}/cafe.ogg`, `${AMBIENT_BASE_PATH}/cafe.mp3`],
    volume: 0.11,
    assetHint:
      "Café murmur, no lyrics, loop-friendly. Freesound / Pixabay CC0 works well.",
  },
  airport: {
    id: "airport",
    files: [
      `${AMBIENT_BASE_PATH}/airport.ogg`,
      `${AMBIENT_BASE_PATH}/airport.mp3`,
    ],
    volume: 0.1,
    assetHint:
      "Terminal ambience — distant PA, rolling bags. Keep announcements unintelligible.",
  },
  fan: {
    id: "fan",
    files: [`${AMBIENT_BASE_PATH}/fan.ogg`, `${AMBIENT_BASE_PATH}/fan.mp3`],
    volume: 0.14,
    assetHint: "Desk or box fan hum, steady, no clicks at loop point.",
  },
  classical: {
    id: "classical",
    files: [
      `${AMBIENT_BASE_PATH}/classical.ogg`,
      `${AMBIENT_BASE_PATH}/classical.mp3`,
    ],
    volume: 0.18,
    assetHint:
      "Soft classical or solo piano, royalty-free / CC0. Avoid vocal tracks.",
  },
};

export type AmbientSourceKind = "file" | "procedural";

export function ambientFilesFor(id: AmbientSoundId): readonly string[] {
  return AMBIENT_CATALOG[id].files;
}
