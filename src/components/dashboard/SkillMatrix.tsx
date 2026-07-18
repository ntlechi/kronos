"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SkillProgress } from "@/lib/types";

export function SkillMatrix({ skills }: { skills: SkillProgress[] }) {
  const { t } = useLocale();

  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {skills.map((skill) => (
        <div
          key={skill.id}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg)] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{skill.name}</p>
            <p className="text-xs text-[var(--accent)]">
              {t("skill.level", { level: skill.level })}
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-soft)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${skill.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {t("skill.xpProgress", {
              xp: skill.xp,
              percent: skill.progressPercent,
              next: skill.level + 1,
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
