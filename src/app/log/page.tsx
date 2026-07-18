"use client";

import { QuickLog } from "@/components/log/QuickLog";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LogPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
          {t("log.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t("log.subtitle")}</p>
      </div>
      <QuickLog />
    </div>
  );
}
