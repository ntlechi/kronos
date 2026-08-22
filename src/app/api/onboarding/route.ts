import { NextResponse } from "next/server";
import { periodRange } from "@/lib/aggregations";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;

  const { start, end } = periodRange("week");

  const [activityCount, logsTotal, logsThisWeek, season] = await Promise.all([
    prisma.project.count({ where: { tenantId, isActive: true } }),
    prisma.timeLog.count({ where: { tenantId } }),
    prisma.timeLog.count({
      where: { tenantId, startedAt: { gte: start, lte: end } },
    }),
    prisma.season.findFirst({
      where: { tenantId, isActive: true },
      include: { _count: { select: { priorities: true } } },
      orderBy: { startsAt: "desc" },
    }),
  ]);

  const steps = {
    activities: activityCount >= 3,
    firstLog: logsTotal >= 1,
    season: (season?._count.priorities ?? 0) >= 1,
    review: logsThisWeek >= 1,
  };

  const complete = Object.values(steps).every(Boolean);

  return NextResponse.json({
    activityCount,
    logsTotal,
    logsThisWeek,
    priorityCount: season?._count.priorities ?? 0,
    steps,
    complete,
  });
}
