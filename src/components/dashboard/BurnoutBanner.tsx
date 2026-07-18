"use client";

import type { BurnoutStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function BurnoutBanner({ status }: { status: BurnoutStatus }) {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border px-4 py-3",
        status.level === "ok" &&
          "border-[rgba(134,239,172,0.25)] bg-[rgba(134,239,172,0.08)]",
        status.level === "watch" &&
          "border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)]",
        status.level === "critical" &&
          "border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.1)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("burnout.title")}
        </p>
        <p
          className={cn(
            "text-sm font-medium tabular-nums",
            status.level === "ok" && "text-[var(--ok)]",
            status.level === "watch" && "text-[var(--warn)]",
            status.level === "critical" && "text-[var(--danger)]",
          )}
        >
          {t("burnout.ratio", {
            percent: Math.round(status.rechargePercentOfDeep),
          })}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
        {t(status.messageKey)}
      </p>
    </div>
  );
}
