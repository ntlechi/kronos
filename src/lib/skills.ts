import type { SkillProgress } from "@/lib/types";

/** XP curve: level N needs N * 100 XP to advance. */
export function xpRequiredForLevel(level: number): number {
  return Math.max(1, level) * 100;
}

export function levelFromTotalXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
} {
  let level = 1;
  let remaining = Math.max(0, totalXp);

  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }

  const xpToNext = xpRequiredForLevel(level);
  return { level, xpIntoLevel: remaining, xpToNext };
}

/** 1 XP per focused minute; recharge skills earn 0.5x; shallow 0.75x. */
export function xpForMinutes(
  minutes: number,
  category: string,
): number {
  const base = Math.max(0, minutes);
  if (category === "RECHARGE") return Math.round(base * 0.5);
  if (category === "SHALLOW_WORK") return Math.round(base * 0.75);
  return base;
}

export function toSkillProgress(skill: {
  id: string;
  name: string;
  xp: number;
  level: number;
}): SkillProgress {
  const derived = levelFromTotalXp(skill.xp);
  return {
    id: skill.id,
    name: skill.name,
    xp: skill.xp,
    level: derived.level,
    xpToNext: derived.xpToNext,
    progressPercent: Math.min(
      100,
      Math.round((derived.xpIntoLevel / derived.xpToNext) * 100),
    ),
  };
}
