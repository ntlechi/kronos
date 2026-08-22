import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { hashPassword } from "@/lib/auth/password";
import { defaultSeasonName, defaultSeasonWindow } from "@/lib/season";

const STARTER_SKILLS = [
  { name: "Frontend Engineering", slug: "frontend-engineering" },
  { name: "Systems Thinking", slug: "systems-thinking" },
  { name: "Rhythm / Movement", slug: "rhythm-movement" },
] as const;

const STARTER_ACTIVITIES = [
  { name: "Personal Ops", slug: "personal-ops", kind: "personal", color: "#E2E8F0" },
  { name: "Deep Work", slug: "deep-work", kind: "brand", color: "#C8F560" },
  { name: "Recharge", slug: "recharge", kind: "lifestyle", color: "#F0ABFC" },
] as const;

export async function provisionWorkspace(input: {
  email: string;
  name: string;
  password: string;
  marketingOptIn?: boolean;
  kitSubscriberId?: string | null;
}) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  const baseSlug = slugify(input.name || email.split("@")[0] || "operator");

  let slug = baseSlug || "operator";
  let i = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: input.name.trim() || email.split("@")[0],
        passwordHash,
        marketingOptIn: Boolean(input.marketingOptIn),
        kitSubscriberId: input.kitSubscriberId ?? null,
      },
    });

    const tenant = await tx.tenant.create({
      data: {
        name: `${user.name}'s workspace`,
        slug,
        plan: "free",
      },
    });

    await tx.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: "owner",
      },
    });

    await tx.pomodoroPrefs.create({
      data: { tenantId: tenant.id },
    });

    const window = defaultSeasonWindow();
    await tx.season.create({
      data: {
        tenantId: tenant.id,
        name: defaultSeasonName(),
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        isActive: true,
      },
    });

    for (const skill of STARTER_SKILLS) {
      await tx.skill.create({
        data: {
          tenantId: tenant.id,
          name: skill.name,
          slug: skill.slug,
        },
      });
    }

    let order = 1;
    for (const activity of STARTER_ACTIVITIES) {
      await tx.project.create({
        data: {
          tenantId: tenant.id,
          name: activity.name,
          slug: activity.slug,
          kind: activity.kind,
          color: activity.color,
          sortOrder: order++,
        },
      });
    }

    return { user, tenant };
  });
}
