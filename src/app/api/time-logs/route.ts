import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { levelFromTotalXp, xpForMinutes } from "@/lib/skills";
import { getTenantContext } from "@/lib/tenant";

const createSchema = z.object({
  projectId: z.string().min(1),
  category: z
    .enum(["DEEP_WORK", "SHALLOW_WORK", "RECHARGE"])
    .default("DEEP_WORK"),
  durationMinutes: z.number().int().positive().max(24 * 60),
  startedAt: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
  source: z.enum(["manual", "stopwatch", "pomodoro"]).default("manual"),
  skillIds: z.array(z.string()).optional(),
  previousProjectId: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number(searchParams.get("limit") ?? 40),
    100,
  );

  const logs = await prisma.timeLog.findMany({
    where: { tenantId },
    include: {
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: { startedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const body = createSchema.parse(await request.json());

  const project = await prisma.project.findFirst({
    where: { id: body.projectId, tenantId },
    include: { skillLinks: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const startedAt = body.startedAt
    ? new Date(body.startedAt)
    : new Date(Date.now() - body.durationMinutes * 60_000);
  const endedAt = new Date(
    startedAt.getTime() + body.durationMinutes * 60_000,
  );

  const skillIds =
    body.skillIds?.length
      ? body.skillIds
      : project.skillLinks.map((l) => l.skillId);

  const result = await prisma.$transaction(async (tx) => {
    if (
      body.previousProjectId &&
      body.previousProjectId !== body.projectId
    ) {
      await tx.contextSwitch.create({
        data: {
          tenantId,
          fromProjectId: body.previousProjectId,
          toProjectId: body.projectId,
          reason: "log",
        },
      });
    }

    const timeLog = await tx.timeLog.create({
      data: {
        tenantId,
        projectId: body.projectId,
        category: body.category,
        durationMinutes: body.durationMinutes,
        startedAt,
        endedAt,
        note: body.note,
        source: body.source,
      },
    });

    const xp = xpForMinutes(body.durationMinutes, body.category);
    for (const skillId of skillIds) {
      const skill = await tx.skill.findFirst({
        where: { id: skillId, tenantId },
      });
      if (!skill) continue;

      const newXp = skill.xp + xp;
      const { level } = levelFromTotalXp(newXp);

      await tx.skill.update({
        where: { id: skill.id },
        data: { xp: newXp, level },
      });

      await tx.skillLog.create({
        data: {
          skillId: skill.id,
          timeLogId: timeLog.id,
          xpGained: xp,
        },
      });
    }

    return timeLog;
  });

  return NextResponse.json({ log: result }, { status: 201 });
}
