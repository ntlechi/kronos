"use client";

import { SeasonEditor } from "@/components/season/SeasonEditor";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function SeasonPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
          {t("season.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t("season.subtitle")}</p>
      </div>
      <SeasonEditor />
    </div>
  );
}
