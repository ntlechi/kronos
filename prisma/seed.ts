import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";

/** hourlyRateCents is optional — user sets it in Activities. Null = no time-value estimate. */
const projects = [
  { name: "Kompul", slug: "kompul", kind: "brand", color: "#C8F560", sortOrder: 1, hourlyRateCents: null },
  { name: "Kapexnet", slug: "kapexnet", kind: "brand", color: "#7DD3FC", sortOrder: 2, hourlyRateCents: null },
  { name: "Bati", slug: "bati", kind: "brand", color: "#FDBA74", sortOrder: 3, hourlyRateCents: null },
  { name: "Survive Backpacking", slug: "survive-backpacking", kind: "brand", color: "#A3E635", sortOrder: 4, hourlyRateCents: null },
  { name: "Desjardins", slug: "desjardins", kind: "brand", color: "#F472B6", sortOrder: 5, hourlyRateCents: null },
  { name: "Personal Ops", slug: "personal-ops", kind: "personal", color: "#E2E8F0", sortOrder: 6, hourlyRateCents: null },
  { name: "Dance", slug: "dance", kind: "lifestyle", color: "#F0ABFC", sortOrder: 7, hourlyRateCents: null },
  { name: "Sports", slug: "sports", kind: "lifestyle", color: "#67E8F9", sortOrder: 8, hourlyRateCents: null },
  { name: "Social", slug: "social", kind: "lifestyle", color: "#FDE68A", sortOrder: 9, hourlyRateCents: null },
] as const;

const skills = [
  { name: "Frontend Engineering", slug: "frontend-engineering" },
  { name: "Operational Architecture", slug: "operational-architecture" },
  { name: "Copywriting", slug: "copywriting" },
  { name: "Physical Logistics", slug: "physical-logistics" },
  { name: "Rhythm / Movement", slug: "rhythm-movement" },
  { name: "Systems Thinking", slug: "systems-thinking" },
] as const;

const projectSkillMap: Record<string, string[]> = {
  kompul: ["frontend-engineering", "operational-architecture", "systems-thinking"],
  kapexnet: ["frontend-engineering", "systems-thinking"],
  bati: ["physical-logistics", "operational-architecture"],
  "survive-backpacking": ["copywriting", "systems-thinking"],
  desjardins: ["operational-architecture", "systems-thinking"],
  "personal-ops": ["systems-thinking"],
  dance: ["rhythm-movement"],
  sports: ["rhythm-movement"],
  social: ["rhythm-movement"],
};

async function main() {
  const passwordHash = await hashPassword("kronos-demo-2026");
  const user = await prisma.user.upsert({
    where: { email: "janara@kronos.local" },
    update: { passwordHash, name: "Janara" },
    create: {
      email: "janara@kronos.local",
      name: "Janara",
      passwordHash,
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "janara" },
    update: { name: "Janara Operator" },
    create: {
      name: "Janara Operator",
      slug: "janara",
    },
  });

  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: { tenantId: tenant.id, userId: user.id },
    },
    update: { role: "owner" },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: "owner",
    },
  });

  await prisma.pomodoroPrefs.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      focusMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      cyclesBeforeLong: 4,
    },
  });

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: {
        tenantId_slug: { tenantId: tenant.id, slug: skill.slug },
      },
      update: { name: skill.name },
      create: {
        tenantId: tenant.id,
        name: skill.name,
        slug: skill.slug,
      },
    });
  }

  const skillRows = await prisma.skill.findMany({
    where: { tenantId: tenant.id },
  });
  const skillBySlug = Object.fromEntries(
    skillRows.map((s) => [s.slug, s]),
  );

  for (const project of projects) {
    const row = await prisma.project.upsert({
      where: {
        tenantId_slug: { tenantId: tenant.id, slug: project.slug },
      },
      update: {
        name: project.name,
        color: project.color,
        kind: project.kind,
        sortOrder: project.sortOrder,
        hourlyRateCents: project.hourlyRateCents,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        name: project.name,
        slug: project.slug,
        color: project.color,
        kind: project.kind,
        sortOrder: project.sortOrder,
        hourlyRateCents: project.hourlyRateCents,
      },
    });

    const links = projectSkillMap[project.slug] ?? [];
    for (const skillSlug of links) {
      const skill = skillBySlug[skillSlug];
      if (!skill) continue;
      await prisma.projectSkill.upsert({
        where: {
          projectId_skillId: {
            projectId: row.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          projectId: row.id,
          skillId: skill.id,
        },
      });
    }
  }

  console.log("Seeded Kronos workspace:", {
    tenant: tenant.slug,
    user: user.email,
    projects: projects.length,
    skills: skills.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
