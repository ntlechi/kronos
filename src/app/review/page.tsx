"use client";

import { WeeklyReviewClient } from "@/components/review/WeeklyReviewClient";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ReviewPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
          {t("review.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t("review.subtitle")}</p>
      </div>
      <WeeklyReviewClient />
    </div>
  );
}
