import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { buildWeeklyReview } from "@/lib/review";
import { getTenantContext } from "@/lib/tenant";

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;

  const [summary, season] = await Promise.all([
    getDashboard(ctx.tenantId, "week", ctx.plan),
    prisma.season.findFirst({
      where: { tenantId: ctx.tenantId, isActive: true },
      include: {
        priorities: {
          orderBy: { sortOrder: "asc" },
          include: {
            project: { select: { id: true, name: true, color: true } },
          },
        },
      },
      orderBy: { startsAt: "desc" },
    }),
  ]);

  const review = buildWeeklyReview(summary);

  const priorityReadout =
    season?.priorities.map((p) => {
      const project = summary.projects.find(
        (row) => row.projectId === p.projectId,
      );
      return {
        id: p.id,
        title: p.title,
        projectId: p.projectId,
        projectName: p.project?.name ?? project?.name ?? null,
        color: p.project?.color ?? project?.color ?? null,
        minutes: project ? Math.round(project.hours * 60) : 0,
        percentOfTotal: project?.percentOfTotal ?? 0,
      };
    }) ?? [];

  return NextResponse.json({
    review: {
      ...review,
      season: season
        ? { id: season.id, name: season.name, priorities: priorityReadout }
        : null,
    },
  });
}
