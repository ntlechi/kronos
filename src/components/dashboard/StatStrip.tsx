"use client";

import { useEffect, useState } from "react";
import { formatHours, formatMoney } from "@/lib/aggregations";
import { usePlan } from "@/lib/billing/PlanProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import Link from "next/link";
import type { DashboardSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

function useCountUp(target: number, enabled: boolean, durationMs = 400) {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, durationMs]);

  return value;
}

export function StatStrip({
  summary,
  animate = false,
}: {
  summary: DashboardSummary;
  animate?: boolean;
}) {
  const { t } = useLocale();
  const { snapshot } = usePlan();
  const focusTotal = summary.deepMinutes + summary.shallowMinutes;
  const deepShare =
    focusTotal > 0 ? Math.round((summary.deepMinutes / focusTotal) * 100) : 0;
  const shallowShare = focusTotal > 0 ? 100 - deepShare : 0;

  const animatedTotal = useCountUp(summary.totalMinutes, animate);
  const animatedCash = useCountUp(summary.totalExpenseCents, animate);
  const animatedSwitches = useCountUp(summary.contextSwitches, animate);

  const secondary = [
    {
      id: "work",
      label: t("stat.totalWork"),
      value: formatHours(animatedTotal),
    },
    {
      id: "cash",
      label: t("stat.capitalOut"),
      value: snapshot.features.capital ? formatMoney(animatedCash) : "Pro",
    },
    {
      id: "switches",
      label: t("stat.switches"),
      value: String(animatedSwitches),
    },
  ];

  return (
    <div className="space-y-3">
      <article className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("stat.deepShallow")}
        </p>

        {focusTotal === 0 ? (
          <p className="metric mt-3 text-4xl font-semibold text-[var(--muted)] sm:text-5xl">
            —
          </p>
        ) : (
          <p className="metric mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("stat.deepPercent", { percent: deepShare })}
          </p>
        )}

        <div
          className="mt-4 flex h-3 overflow-hidden rounded-full bg-[var(--bg-soft)]"
          role="img"
          aria-label={t("stat.deepShallow")}
        >
          {focusTotal === 0 ? (
            <div className="h-full w-full border border-dashed border-[var(--line)]" />
          ) : (
            <>
              <div
                className="h-full bg-[var(--ink)] transition-[width] duration-400 ease-out"
                style={{ width: `${deepShare}%` }}
              />
              <div
                className="h-full bg-[var(--muted)]/40 transition-[width] duration-400 ease-out"
                style={{ width: `${shallowShare}%` }}
              />
            </>
          )}
        </div>

        <div className="mt-3 flex justify-between text-xs text-[var(--muted)]">
          <span>
            {t("stat.deepLabel")}{" "}
            <span className="metric text-[var(--ink)]">
              {formatHours(summary.deepMinutes)}
            </span>
          </span>
          <span>
            {t("stat.shallowLabel")}{" "}
            <span className="metric text-[var(--ink)]">
              {formatHours(summary.shallowMinutes)}
            </span>
          </span>
        </div>
      </article>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {secondary.map((item) => {
          const locked = item.id === "cash" && !snapshot.features.capital;
          const inner = (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-[11px]">
                {item.label}
              </p>
              <p className="metric mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                {item.value}
              </p>
            </>
          );
          return locked ? (
            <Link
              key={item.id}
              href="/pricing"
              className={cn(
                "rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-3 sm:px-4 sm:py-4",
              )}
              title={t("plan.limit.capital")}
            >
              {inner}
            </Link>
          ) : (
            <div
              key={item.id}
              className={cn(
                "rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-3 sm:px-4 sm:py-4",
              )}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
