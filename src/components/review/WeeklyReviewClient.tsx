"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatHours } from "@/lib/aggregations";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { WeeklyReviewModel } from "@/lib/review";
import { BurnoutBanner } from "@/components/dashboard/BurnoutBanner";

export function WeeklyReviewClient() {
  const { t } = useLocale();
  const [review, setReview] = useState<WeeklyReviewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/review", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{ review: WeeklyReviewModel }>;
      })
      .then((data) => setReview(data.review))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(t("review.error"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [t]);

  if (loading && !review) {
    return <p className="text-sm text-[var(--muted)]">{t("review.loading")}</p>;
  }

  if (error || !review) {
    return (
      <div className="rounded-[var(--radius)] border border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.08)] px-4 py-3 text-sm">
        {error ?? t("review.error")}
      </div>
    );
  }

  const { summary, deepShare, topBrand, insight } = review;
  const focusTotal = summary.deepMinutes + summary.shallowMinutes;

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "rounded-[var(--radius)] border px-4 py-4",
          insight.severity === "ok" && "border-[var(--line)] bg-[var(--bg-elevated)]",
          insight.severity === "watch" &&
            "border-[rgba(232,184,74,0.35)] bg-[rgba(232,184,74,0.08)]",
          insight.severity === "critical" &&
            "border-[rgba(240,113,120,0.45)] bg-[rgba(240,113,120,0.08)]",
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("review.verdict")}
        </p>
        <p className="mt-2 text-base leading-relaxed text-[var(--ink)]">
          {insight.key === "review.insight.overheat"
            ? t(insight.key, {
                amount: formatHours(Number(insight.vars?.amount ?? 0)),
              })
            : t(insight.key, insight.vars)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label={t("stat.totalWork")}
          value={formatHours(summary.totalMinutes)}
        />
        <Metric
          label={t("stat.deepShallow")}
          value={
            focusTotal > 0
              ? t("stat.deepPercent", { percent: deepShare })
              : "—"
          }
        />
        <Metric
          label={t("review.rechargeLabel")}
          value={formatHours(summary.rechargeMinutes)}
        />
        <Metric
          label={t("stat.switches")}
          value={String(summary.contextSwitches)}
        />
      </div>

      <BurnoutBanner
        status={summary.burnout}
        deepMinutes={summary.deepMinutes}
      />

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
          {t("review.brandsTitle")}
        </h2>
        {summary.projects.filter((p) => p.hours > 0).length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t("review.brandsEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {summary.projects
              .filter((p) => p.hours > 0)
              .slice(0, 8)
              .map((p) => (
                <li
                  key={p.projectId}
                  className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-3"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: p.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-soft)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, p.percentOfTotal)}%`,
                          background: p.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="metric text-sm font-semibold">
                      {formatHours(Math.round(p.hours * 60))}
                    </p>
                    <p className="metric text-xs text-[var(--muted)]">
                      {Math.round(p.percentOfTotal)}%
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        )}
        {topBrand && (
          <p className="text-xs text-[var(--muted)]">
            {t("review.topBrand", {
              name: topBrand.name,
              percent: topBrand.percent,
            })}
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/pomodoro"
          className="accent-fill inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
        >
          {t("review.ctaFocus")}
        </Link>
        <Link
          href="/log"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-5 text-sm font-medium"
        >
          {t("review.ctaLog")}
        </Link>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="metric mt-2 text-lg font-semibold sm:text-xl">{value}</p>
    </div>
  );
}
