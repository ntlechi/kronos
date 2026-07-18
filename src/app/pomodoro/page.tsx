"use client";

import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PomodoroPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
          {t("focus.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t("focus.subtitle")}</p>
      </div>
      <PomodoroTimer />
    </div>
  );
}
