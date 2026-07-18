"use client";

import { SkillsManager } from "@/components/skills/SkillsManager";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function SkillsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
          {t("skills.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t("skills.subtitle")}
        </p>
      </div>
      <SkillsManager />
    </div>
  );
}
