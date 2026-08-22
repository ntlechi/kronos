import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActivitySlot, requirePro } from "@/lib/billing/enforce";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { getTenantContext } from "@/lib/tenant";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  kind: z.enum(["brand", "personal", "lifestyle"]).default("brand"),
  color: z.string().min(4).max(20).optional(),
  hourlyRateCents: z.number().int().nonnegative().nullable().optional(),
  skillIds: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80).optional(),
  kind: z.enum(["brand", "personal", "lifestyle"]).optional(),
  color: z.string().min(4).max(20).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  hourlyRateCents: z.number().int().nonnegative().nullable().optional(),
  skillIds: z.array(z.string()).optional(),
});

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const projects = await prisma.project.findMany({
    where: { tenantId, isActive: true },
    include: {
      skillLinks: {
        include: {
          skill: { select: { id: true, name: true, xp: true, level: true } },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const mapped = projects.map((p) => ({
    ...p,
    skills: p.skillLinks.map((l) => l.skill),
    skillIds: p.skillLinks.map((l) => l.skillId),
  }));
  return NextResponse.json({
    projects: mapped,
    // UI alias — same entities, friendlier name for lifestyle + brands
    activities: mapped,
    plan: ctx.planSnapshot,
  });
}

export async function POST(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const blocked = requireActivitySlot(ctx.planSnapshot);
  if (blocked) return blocked;

  const body = createSchema.parse(await request.json());
  if (body.hourlyRateCents != null) {
    const pro = requirePro(
      ctx.planSnapshot,
      "RATE_PRO",
      "Hourly rates are a Pro feature.",
    );
    if (pro) return pro;
  }

  const baseSlug = slugify(body.name) || "project";
  let slug = baseSlug;
  let i = 1;
  while (
    await prisma.project.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    })
  ) {
    slug = `${baseSlug}-${i++}`;
  }

  const maxSort = await prisma.project.aggregate({
    where: { tenantId },
    _max: { sortOrder: true },
  });

  const skillIds = body.skillIds ?? [];
  if (skillIds.length) {
    const owned = await prisma.skill.count({
      where: { tenantId, id: { in: skillIds } },
    });
    if (owned !== skillIds.length) {
      return NextResponse.json({ error: "Invalid skill ids" }, { status: 400 });
    }
  }

  const project = await prisma.project.create({
    data: {
      tenantId,
      name: body.name,
      slug,
      kind: body.kind,
      color: body.color ?? "#C8F560",
      hourlyRateCents: body.hourlyRateCents ?? null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      skillLinks: {
        create: skillIds.map((skillId) => ({ skillId })),
      },
    },
    include: {
      skillLinks: {
        include: {
          skill: { select: { id: true, name: true, xp: true, level: true } },
        },
      },
    },
  });

  return NextResponse.json(
    {
      project: {
        ...project,
        skills: project.skillLinks.map((l) => l.skill),
        skillIds: project.skillLinks.map((l) => l.skillId),
      },
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const body = updateSchema.parse(await request.json());

  const existing = await prisma.project.findFirst({
    where: { id: body.id, tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    body.hourlyRateCents !== undefined &&
    body.hourlyRateCents !== existing.hourlyRateCents
  ) {
    const pro = requirePro(
      ctx.planSnapshot,
      "RATE_PRO",
      "Hourly rates are a Pro feature.",
    );
    if (pro) return pro;
  }

  if (body.skillIds) {
    const owned = await prisma.skill.count({
      where: { tenantId, id: { in: body.skillIds } },
    });
    if (owned !== body.skillIds.length) {
      return NextResponse.json({ error: "Invalid skill ids" }, { status: 400 });
    }
  }

  await prisma.project.update({
    where: { id: body.id },
    data: {
      name: body.name,
      kind: body.kind,
      color: body.color,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
      hourlyRateCents: body.hourlyRateCents,
    },
  });

  if (body.skillIds) {
    await prisma.$transaction([
      prisma.projectSkill.deleteMany({ where: { projectId: body.id } }),
      ...(body.skillIds.length
        ? [
            prisma.projectSkill.createMany({
              data: body.skillIds.map((skillId) => ({
                projectId: body.id,
                skillId,
              })),
            }),
          ]
        : []),
    ]);
  }

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: body.id },
    include: {
      skillLinks: {
        include: {
          skill: { select: { id: true, name: true, xp: true, level: true } },
        },
      },
    },
  });

  return NextResponse.json({
    project: {
      ...project,
      skills: project.skillLinks.map((l) => l.skill),
      skillIds: project.skillLinks.map((l) => l.skillId),
    },
  });
}
