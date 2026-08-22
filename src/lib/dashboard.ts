import { subDays } from "date-fns";
import { buildDashboardSummary, periodRange } from "@/lib/aggregations";
import { FREE_LIMITS, isPro, type PlanId } from "@/lib/billing/plan";
import { prisma } from "@/lib/prisma";
import type { Period } from "@/lib/types";

export function clampDashboardRange(
  period: Period,
  plan: PlanId,
  now = new Date(),
) {
  const range = periodRange(period, now);
  if (isPro(plan)) {
    return { start: range.start, end: range.end, historyCapped: false, period };
  }

  const minStart = subDays(now, FREE_LIMITS.historyDays);
  const effectivePeriod: Period = period === "year" ? "month" : period;
  const effectiveRange =
    period === "year" ? periodRange("month", now) : range;
  const start =
    effectiveRange.start < minStart ? minStart : effectiveRange.start;

  return {
    start,
    end: effectiveRange.end,
    historyCapped: period === "year" || start > range.start,
    period: effectivePeriod,
  };
}

export async function getDashboard(
  tenantId: string,
  period: Period = "week",
  plan: PlanId = "free",
) {
  const { start, end } = clampDashboardRange(period, plan);

  const [activities, timeLogs, expenses, contextSwitchCount, skills] =
    await Promise.all([
      prisma.project.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          name: true,
          color: true,
          kind: true,
          hourlyRateCents: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.timeLog.findMany({
        where: {
          tenantId,
          startedAt: { gte: start, lte: end },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
              kind: true,
              hourlyRateCents: true,
            },
          },
        },
      }),
      isPro(plan)
        ? prisma.expenseLog.findMany({
            where: {
              tenantId,
              spentAt: { gte: start, lte: end },
            },
            select: { projectId: true, amountCents: true },
          })
        : Promise.resolve([]),
      prisma.contextSwitch.count({
        where: {
          tenantId,
          switchedAt: { gte: start, lte: end },
        },
      }),
      prisma.skill.findMany({
        where: { tenantId },
        orderBy: { xp: "desc" },
      }),
    ]);

  const hideCapital = !isPro(plan);
  const activitiesForPlan = hideCapital
    ? activities.map((a) => ({ ...a, hourlyRateCents: null }))
    : activities;
  const logsForPlan = hideCapital
    ? timeLogs.map((log) => ({
        ...log,
        project: { ...log.project, hourlyRateCents: null },
      }))
    : timeLogs;

  return buildDashboardSummary({
    period,
    rangeStart: start,
    rangeEnd: end,
    activities: activitiesForPlan,
    timeLogs: logsForPlan,
    expenses,
    contextSwitchCount,
    skills,
  });
}
