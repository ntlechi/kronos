"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ActivityTimeGauges } from "@/components/dashboard/ActivityTimeGauges";
import { BurnoutBanner } from "@/components/dashboard/BurnoutBanner";
import { FoldableSkills } from "@/components/dashboard/FoldableSkills";
import { PeriodTabs } from "@/components/dashboard/PeriodTabs";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { DashboardSummary, Period } from "@/lib/types";

export function DashboardClient({
  initialPeriod = "week",
}: {
  initialPeriod?: Period;
}) {
  const { t } = useLocale();
  const tRef = useRef(t);
  tRef.current = t;

  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void fetch(`/api/dashboard?period=${period}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json() as Promise<{ summary: DashboardSummary }>;
      })
      .then((data) => {
        setSummary(data.summary);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(tRef.current("dashboard.error"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodTabs value={period} onChange={setPeriod} />
        <Link
          href="/log"
          className="accent-fill inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
        >
          {t("dashboard.quickLog")}
        </Link>
      </div>

      {error && (
        <div className="rounded-[var(--radius)] border border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.08)] px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && !summary && (
        <p className="text-sm text-[var(--muted)]">{t("dashboard.loading")}</p>
      )}

      {summary && (
        <>
          <StatStrip summary={summary} />
          <BurnoutBanner status={summary.burnout} />

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
                {t("dashboard.breakdownTitle")}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {t("dashboard.breakdownHint")}
              </p>
            </div>
            <ActivityTimeGauges
              activities={summary.projects}
              totalMinutes={summary.totalMinutes}
            />
          </section>

          <FoldableSkills skills={summary.skills} />
        </>
      )}
    </div>
  );
}
