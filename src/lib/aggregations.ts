import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { evaluateBurnout } from "@/lib/burnout";
import { toSkillProgress } from "@/lib/skills";
import type {
  DashboardSummary,
  Period,
  ProjectBreakdown,
} from "@/lib/types";

export function periodRange(period: Period, now = new Date()) {
  switch (period) {
    case "day":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "year":
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

type ActivitySeed = {
  id: string;
  name: string;
  color: string;
  kind: string;
  hourlyRateCents: number | null;
};

type TimeRow = {
  projectId: string;
  category: string;
  durationMinutes: number;
  project: ActivitySeed;
};

type ExpenseRow = {
  projectId: string;
  amountCents: number;
};

function emptyBreakdown(activity: ActivitySeed): ProjectBreakdown {
  return {
    projectId: activity.id,
    name: activity.name,
    color: activity.color,
    kind: activity.kind,
    hours: 0,
    percentOfTotal: 0,
    expenseCents: 0,
    estimatedTimeValueCents: 0,
    hourlyRateCents: activity.hourlyRateCents,
    deepMinutes: 0,
    shallowMinutes: 0,
    rechargeMinutes: 0,
  };
}

export function buildDashboardSummary(input: {
  period: Period;
  rangeStart: Date;
  rangeEnd: Date;
  activities: ActivitySeed[];
  timeLogs: TimeRow[];
  expenses: ExpenseRow[];
  contextSwitchCount: number;
  skills: { id: string; name: string; xp: number; level: number }[];
}): DashboardSummary {
  const projectMap = new Map<string, ProjectBreakdown>();

  for (const activity of input.activities) {
    projectMap.set(activity.id, emptyBreakdown(activity));
  }

  let deepMinutes = 0;
  let shallowMinutes = 0;
  let rechargeMinutes = 0;
  let totalMinutes = 0;

  for (const log of input.timeLogs) {
    totalMinutes += log.durationMinutes;
    if (log.category === "DEEP_WORK") deepMinutes += log.durationMinutes;
    else if (log.category === "SHALLOW_WORK")
      shallowMinutes += log.durationMinutes;
    else rechargeMinutes += log.durationMinutes;

    const existing =
      projectMap.get(log.projectId) ?? emptyBreakdown(log.project);

    existing.hours += log.durationMinutes / 60;
    if (log.category === "DEEP_WORK")
      existing.deepMinutes += log.durationMinutes;
    else if (log.category === "SHALLOW_WORK")
      existing.shallowMinutes += log.durationMinutes;
    else existing.rechargeMinutes += log.durationMinutes;

    if (existing.hourlyRateCents) {
      existing.estimatedTimeValueCents += Math.round(
        (log.durationMinutes / 60) * existing.hourlyRateCents,
      );
    }

    projectMap.set(log.projectId, existing);
  }

  let totalExpenseCents = 0;
  for (const expense of input.expenses) {
    totalExpenseCents += expense.amountCents;
    const existing = projectMap.get(expense.projectId);
    if (existing) {
      existing.expenseCents += expense.amountCents;
    }
  }

  const projects = [...projectMap.values()]
    .map((row) => ({
      ...row,
      percentOfTotal:
        totalMinutes > 0
          ? Math.round(((row.hours * 60) / totalMinutes) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name));

  const rechargeRatio =
    totalMinutes > 0 ? rechargeMinutes / totalMinutes : 0;

  return {
    period: input.period,
    rangeStart: input.rangeStart.toISOString(),
    rangeEnd: input.rangeEnd.toISOString(),
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    totalExpenseCents,
    deepMinutes,
    shallowMinutes,
    rechargeMinutes,
    rechargeRatio,
    burnout: evaluateBurnout(deepMinutes, rechargeMinutes),
    contextSwitches: input.contextSwitchCount,
    projects,
    skills: input.skills.map(toSkillProgress),
  };
}

/** Metric-safe duration: spaced units so 0 never reads as "o"/"O". */
export function formatHours(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatMoney(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
