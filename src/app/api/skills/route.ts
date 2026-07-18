import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { getTenantContext } from "@/lib/tenant";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  activityIds: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80).optional(),
  activityIds: z.array(z.string()).optional(),
});

async function uniqueSkillSlug(
  tenantId: string,
  name: string,
  excludeId?: string,
) {
  const base = slugify(name) || "skill";
  let slug = base;
  let i = 1;
  while (true) {
    const hit = await prisma.skill.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    if (!hit || hit.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const skills = await prisma.skill.findMany({
    where: { tenantId },
    include: {
      projects: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
              kind: true,
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: [{ xp: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      xp: skill.xp,
      level: skill.level,
      activities: skill.projects
        .filter((link) => link.project.isActive)
        .map((link) => link.project),
      activityIds: skill.projects.map((link) => link.projectId),
    })),
  });
}

export async function POST(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const body = createSchema.parse(await request.json());
  const slug = await uniqueSkillSlug(tenantId, body.name);

  const activityIds = body.activityIds ?? [];
  if (activityIds.length) {
    const owned = await prisma.project.count({
      where: { tenantId, id: { in: activityIds } },
    });
    if (owned !== activityIds.length) {
      return NextResponse.json(
        { error: "Invalid activity ids" },
        { status: 400 },
      );
    }
  }

  const skill = await prisma.skill.create({
    data: {
      tenantId,
      name: body.name.trim(),
      slug,
      projects: {
        create: activityIds.map((projectId) => ({ projectId })),
      },
    },
    include: {
      projects: {
        include: {
          project: {
            select: { id: true, name: true, color: true, kind: true },
          },
        },
      },
    },
  });

  return NextResponse.json(
    {
      skill: {
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        xp: skill.xp,
        level: skill.level,
        activities: skill.projects.map((l) => l.project),
        activityIds: skill.projects.map((l) => l.projectId),
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

  const existing = await prisma.skill.findFirst({
    where: { id: body.id, tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.activityIds) {
    const owned = await prisma.project.count({
      where: { tenantId, id: { in: body.activityIds } },
    });
    if (owned !== body.activityIds.length) {
      return NextResponse.json(
        { error: "Invalid activity ids" },
        { status: 400 },
      );
    }
  }

  if (body.name && body.name.trim() !== existing.name) {
    await prisma.skill.update({
      where: { id: body.id },
      data: {
        name: body.name.trim(),
        slug: await uniqueSkillSlug(tenantId, body.name, body.id),
      },
    });
  }

  if (body.activityIds) {
    await prisma.$transaction([
      prisma.projectSkill.deleteMany({ where: { skillId: body.id } }),
      ...(body.activityIds.length
        ? [
            prisma.projectSkill.createMany({
              data: body.activityIds.map((projectId) => ({
                skillId: body.id,
                projectId,
              })),
            }),
          ]
        : []),
    ]);
  }

  const skill = await prisma.skill.findUniqueOrThrow({
    where: { id: body.id },
    include: {
      projects: {
        include: {
          project: {
            select: { id: true, name: true, color: true, kind: true },
          },
        },
      },
    },
  });

  return NextResponse.json({
    skill: {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      xp: skill.xp,
      level: skill.level,
      activities: skill.projects.map((l) => l.project),
      activityIds: skill.projects.map((l) => l.projectId),
    },
  });
}

export async function DELETE(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const existing = await prisma.skill.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
