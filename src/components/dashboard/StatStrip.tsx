"use client";

import { formatHours, formatMoney } from "@/lib/aggregations";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { DashboardSummary } from "@/lib/types";

export function StatStrip({ summary }: { summary: DashboardSummary }) {
  const { t } = useLocale();

  const items = [
    {
      id: "work",
      label: t("stat.totalWork"),
      value: formatHours(summary.totalMinutes),
      hint: t("stat.totalWorkHint", { hours: summary.totalHours }),
    },
    {
      id: "cash",
      label: t("stat.capitalOut"),
      value: formatMoney(summary.totalExpenseCents),
      hint: t("stat.capitalHint"),
    },
    {
      id: "deep",
      label: t("stat.deepShallow"),
      value: `${formatHours(summary.deepMinutes)} / ${formatHours(summary.shallowMinutes)}`,
      hint: t("stat.deepShallowHint"),
    },
    {
      id: "switches",
      label: t("stat.switches"),
      value: String(summary.contextSwitches),
      hint: t("stat.switchesHint"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-4"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            {item.label}
          </p>
          <p className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight tabular-nums">
            {item.value}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}
