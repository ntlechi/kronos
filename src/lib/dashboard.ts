import { buildDashboardSummary, periodRange } from "@/lib/aggregations";
import { prisma } from "@/lib/prisma";
import type { Period } from "@/lib/types";

export async function getDashboard(
  tenantId: string,
  period: Period = "week",
) {
  const { start, end } = periodRange(period);

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
      prisma.expenseLog.findMany({
        where: {
          tenantId,
          spentAt: { gte: start, lte: end },
        },
        select: { projectId: true, amountCents: true },
      }),
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

  return buildDashboardSummary({
    period,
    rangeStart: start,
    rangeEnd: end,
    activities,
    timeLogs,
    expenses,
    contextSwitchCount,
    skills,
  });
}
