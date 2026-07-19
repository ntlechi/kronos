"use client";

import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Period } from "@/lib/types";

const periods: { id: Period; labelKey: string }[] = [
  { id: "day", labelKey: "period.day" },
  { id: "week", labelKey: "period.week" },
  { id: "month", labelKey: "period.month" },
  { id: "year", labelKey: "period.year" },
];

export function PeriodTabs({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] p-1">
      {periods.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            "min-h-10 rounded-full px-4 text-sm font-semibold transition-colors",
            value === p.id
              ? "bg-[var(--bg-soft)] text-[var(--ink)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]",
          )}
        >
          {t(p.labelKey)}
        </button>
      ))}
    </div>
  );
}
