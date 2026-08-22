export type AmbientHandle = {
  start: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  dispose: () => void;
};
