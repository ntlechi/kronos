import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  defaultSeasonName,
  defaultSeasonWindow,
  MAX_SEASON_PRIORITIES,
} from "@/lib/season";
import { getTenantContext } from "@/lib/tenant";

const prioritySchema = z.object({
  title: z.string().min(1).max(80),
  projectId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).max(2).optional(),
});

const upsertSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  priorities: z.array(prioritySchema).max(MAX_SEASON_PRIORITIES),
});

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;

  let season = await prisma.season.findFirst({
    where: { tenantId, isActive: true },
    include: {
      priorities: {
        orderBy: { sortOrder: "asc" },
        include: {
          project: { select: { id: true, name: true, color: true } },
        },
      },
    },
    orderBy: { startsAt: "desc" },
  });

  if (!season) {
    const window = defaultSeasonWindow();
    season = await prisma.season.create({
      data: {
        tenantId,
        name: defaultSeasonName(),
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        isActive: true,
      },
      include: {
        priorities: {
          orderBy: { sortOrder: "asc" },
          include: {
            project: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });
  }

  return NextResponse.json({ season });
}

export async function PUT(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const body = upsertSchema.parse(await request.json());

  if (body.priorities.length > MAX_SEASON_PRIORITIES) {
    return NextResponse.json(
      { error: `Max ${MAX_SEASON_PRIORITIES} priorities` },
      { status: 400 },
    );
  }

  const projectIds = body.priorities
    .map((p) => p.projectId)
    .filter((id): id is string => Boolean(id));
  if (projectIds.length) {
    const owned = await prisma.project.count({
      where: { tenantId, id: { in: projectIds } },
    });
    if (owned !== projectIds.length) {
      return NextResponse.json({ error: "Invalid activity" }, { status: 400 });
    }
  }

  let season = await prisma.season.findFirst({
    where: { tenantId, isActive: true },
    orderBy: { startsAt: "desc" },
  });

  if (!season) {
    const window = defaultSeasonWindow();
    season = await prisma.season.create({
      data: {
        tenantId,
        name: body.name ?? defaultSeasonName(),
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        isActive: true,
      },
    });
  } else if (body.name) {
    season = await prisma.season.update({
      where: { id: season.id },
      data: { name: body.name },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.seasonPriority.deleteMany({ where: { seasonId: season!.id } });
    if (body.priorities.length) {
      await tx.seasonPriority.createMany({
        data: body.priorities.map((p, i) => ({
          seasonId: season!.id,
          title: p.title.trim(),
          sortOrder: p.sortOrder ?? i,
          projectId: p.projectId ?? null,
        })),
      });
    }
  });

  const full = await prisma.season.findUniqueOrThrow({
    where: { id: season.id },
    include: {
      priorities: {
        orderBy: { sortOrder: "asc" },
        include: {
          project: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });

  return NextResponse.json({ season: full });
}
