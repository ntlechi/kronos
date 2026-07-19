"use client";

import { useEffect, useState } from "react";
import { formatHours, formatMoney } from "@/lib/aggregations";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ProjectBreakdown as ActivityRow } from "@/lib/types";
import { cn } from "@/lib/cn";

function GaugeRing({
  percent,
  color,
  label,
  animate,
  ghost,
}: {
  percent: number;
  color: string;
  label: string;
  animate: boolean;
  ghost: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const r = 42;
  const c = 2 * Math.PI * r;
  const [display, setDisplay] = useState(animate ? 0 : clamped);

  useEffect(() => {
    if (!animate) {
      setDisplay(clamped);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(clamped * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clamped, animate]);

  const dash = (display / 100) * c;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[140px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
          strokeDasharray={ghost ? "4 6" : undefined}
        />
        {!ghost && (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ transition: animate ? undefined : "stroke-dasharray 400ms ease-out" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <p className="metric text-2xl font-semibold tracking-tight">
          {ghost ? "—" : label}
        </p>
      </div>
    </div>
  );
}

export function ActivityTimeGauges({
  activities,
  totalMinutes,
  animate = false,
}: {
  activities: ActivityRow[];
  totalMinutes: number;
  animate?: boolean;
}) {
  const { t } = useLocale();

  if (activities.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--muted)]">
        {t("dashboard.emptyBreakdown")}
      </div>
    );
  }

  const topId = activities.find((a) => a.hours > 0)?.projectId;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activities.map((activity) => {
          const minutes = Math.round(activity.hours * 60);
          const isTop = activity.projectId === topId && minutes > 0;
          const ghost = minutes === 0;
          const kindKey =
            activity.kind === "brand" ||
            activity.kind === "personal" ||
            activity.kind === "lifestyle"
              ? `kind.${activity.kind}`
              : "kind.personal";

          return (
            <article
              key={activity.projectId}
              className={cn(
                "rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-3 sm:p-4",
                isTop && "ring-1 ring-[var(--ink)]/20",
              )}
            >
              <GaugeRing
                percent={activity.percentOfTotal}
                color={activity.color}
                label={`${activity.percentOfTotal}%`}
                animate={animate && !ghost}
                ghost={ghost}
              />

              <div className="mt-3 text-center">
                <p className="truncate text-sm font-semibold">{activity.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {t(kindKey)}
                </p>
                {ghost ? (
                  <p className="mt-2 text-xs leading-snug text-[var(--muted)]">
                    {t("dashboard.gaugeGhost")}
                  </p>
                ) : (
                  <>
                    <p className="metric mt-2 text-lg font-semibold">
                      {formatHours(minutes)}
                    </p>
                    {totalMinutes > 0 && (
                      <p className="text-xs text-[var(--muted)]">
                        {t("dashboard.ofTotal", {
                          percent: activity.percentOfTotal,
                        })}
                      </p>
                    )}
                    {activity.expenseCents > 0 && (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {t("dashboard.cashSpent", {
                          money: formatMoney(activity.expenseCents),
                        })}
                      </p>
                    )}
                    {isTop && (
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        {t("dashboard.mostTime")}
                      </p>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
