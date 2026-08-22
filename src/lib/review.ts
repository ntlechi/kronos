import type { DashboardSummary } from "@/lib/types";

export type ReviewInsight = {
  key:
    | "review.insight.empty"
    | "review.insight.overheat"
    | "review.insight.scatter"
    | "review.insight.shallow"
    | "review.insight.focused"
    | "review.insight.balanced";
  severity: "ok" | "watch" | "critical";
  vars?: Record<string, string | number>;
};

export type WeeklyReviewModel = {
  summary: DashboardSummary;
  deepShare: number;
  topBrand: { name: string; percent: number } | null;
  activeBrands: number;
  insight: ReviewInsight;
  season?: {
    id: string;
    name: string;
    priorities: {
      id: string;
      title: string;
      projectId: string | null;
      projectName: string | null;
      color: string | null;
      minutes: number;
      percentOfTotal: number;
    }[];
  } | null;
};

export function buildWeeklyReview(
  summary: DashboardSummary,
): WeeklyReviewModel {
  const focusTotal = summary.deepMinutes + summary.shallowMinutes;
  const deepShare =
    focusTotal > 0
      ? Math.round((summary.deepMinutes / focusTotal) * 100)
      : 0;

  const withTime = summary.projects.filter((p) => p.hours > 0);
  const top = withTime[0];
  const topBrand = top
    ? { name: top.name, percent: Math.round(top.percentOfTotal) }
    : null;

  let insight: ReviewInsight;

  if (summary.totalMinutes === 0) {
    insight = { key: "review.insight.empty", severity: "ok" };
  } else if (
    summary.burnout.level === "critical" ||
    summary.burnout.level === "watch"
  ) {
    insight = {
      key: "review.insight.overheat",
      severity: summary.burnout.level,
      vars: { amount: summary.burnout.deficitMinutes },
    };
  } else if (withTime.length >= 5 && (topBrand?.percent ?? 100) < 35) {
    insight = {
      key: "review.insight.scatter",
      severity: "watch",
      vars: { count: withTime.length },
    };
  } else if (focusTotal > 0 && deepShare < 40) {
    insight = {
      key: "review.insight.shallow",
      severity: "watch",
      vars: { percent: deepShare },
    };
  } else if (topBrand && topBrand.percent >= 50) {
    insight = {
      key: "review.insight.focused",
      severity: "ok",
      vars: { name: topBrand.name, percent: topBrand.percent },
    };
  } else {
    insight = { key: "review.insight.balanced", severity: "ok" };
  }

  return {
    summary,
    deepShare,
    topBrand,
    activeBrands: withTime.length,
    insight,
  };
}
