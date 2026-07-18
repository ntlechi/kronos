"use client";

import { ActivityManager } from "@/components/activities/ActivityManager";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ActivitiesPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
          {t("activities.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t("activities.subtitle")}
        </p>
      </div>
      <ActivityManager />
    </div>
  );
}
