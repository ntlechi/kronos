"use client";

import type { BurnoutStatus } from "@/lib/types";
import { formatHours } from "@/lib/aggregations";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Persistent capacity meter — green→amber→red zones with a threshold tick. */
export function BurnoutBanner({
  status,
  deepMinutes,
}: {
  status: BurnoutStatus;
  deepMinutes: number;
}) {
  const { t } = useLocale();
  const armed = deepMinutes > 0;
  const ratio = armed
    ? Math.min(100, Math.max(0, status.rechargePercentOfDeep))
    : 0;
  const threshold = status.thresholdPercent;
  const breached = status.level === "watch" || status.level === "critical";

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border px-4 py-4 transition-colors",
        breached
          ? "border-[rgba(240,113,120,0.45)] bg-[rgba(240,113,120,0.08)]"
          : "border-[var(--line)] bg-[var(--bg-elevated)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("burnout.capacity")}
        </p>
        <p
          className={cn(
            "metric text-sm font-semibold",
            status.level === "ok" && "text-[var(--ok)]",
            status.level === "watch" && "text-[var(--warn)]",
            status.level === "critical" && "text-[var(--danger)]",
          )}
        >
          {armed
            ? t("burnout.capacityValue", { percent: Math.round(ratio) })
            : t("burnout.capacityIdle")}
        </p>
      </div>

      <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--bg-soft)]">
        {/* Zone wash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(90deg,
              var(--danger) 0%,
              var(--danger) ${threshold * 0.5}%,
              var(--warn) ${threshold * 0.5}%,
              var(--warn) ${threshold}%,
              var(--ok) ${threshold}%,
              var(--ok) 100%)`,
          }}
        />
        {/* Fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out",
            status.level === "critical" && "bg-[var(--danger)]",
            status.level === "watch" && "bg-[var(--warn)]",
            status.level === "ok" && "bg-[var(--ok)]",
          )}
          style={{ width: armed ? `${ratio}%` : "0%" }}
        />
        {/* Threshold tick */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--ink)]"
          style={{ left: `${threshold}%` }}
          aria-hidden
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <span>0%</span>
        <span className="metric">
          {t("burnout.thresholdTick", { percent: threshold })}
        </span>
        <span>100%</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">
        {!armed
          ? t("burnout.none")
          : breached
            ? t("burnout.breach", {
                amount: formatHours(status.deficitMinutes),
              })
            : t(status.messageKey)}
      </p>
    </div>
  );
}
