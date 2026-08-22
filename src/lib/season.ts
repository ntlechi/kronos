import { addDays } from "date-fns";

export const MAX_SEASON_PRIORITIES = 3;
export const SEASON_LENGTH_DAYS = 84; // ~12 weeks

export function defaultSeasonWindow(now = new Date()) {
  return {
    startsAt: now,
    endsAt: addDays(now, SEASON_LENGTH_DAYS),
  };
}

export function defaultSeasonName(now = new Date()) {
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Q${q} ${now.getFullYear()}`;
}
