import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPlanSnapshot,
  FREE_LIMITS,
  isPro,
  type PlanCode,
  type PlanSnapshot,
} from "@/lib/billing/plan";

export function planLimitResponse(code: PlanCode, message: string) {
  return NextResponse.json(
    {
      error: "plan_limit",
      code,
      message,
      upgrade: "/pricing",
    },
    { status: 402 },
  );
}

export async function loadPlanSnapshot(
  tenantId: string,
  userId: string,
): Promise<PlanSnapshot> {
  const [tenant, activities, skills, workspaces] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: { plan: true },
    }),
    prisma.project.count({ where: { tenantId, isActive: true } }),
    prisma.skill.count({ where: { tenantId } }),
    prisma.tenantMember.count({ where: { userId } }),
  ]);

  return buildPlanSnapshot({
    plan: tenant.plan,
    activities,
    skills,
    workspaces,
  });
}

export function requirePro(snapshot: PlanSnapshot, code: PlanCode, message: string) {
  if (snapshot.isPro) return null;
  return planLimitResponse(code, message);
}

export function requireActivitySlot(snapshot: PlanSnapshot) {
  if (snapshot.isPro || snapshot.usage.activities < FREE_LIMITS.activities) {
    return null;
  }
  return planLimitResponse(
    "ACTIVITY_LIMIT",
    `Free includes ${FREE_LIMITS.activities} activities.`,
  );
}

export function requireSkillSlot(snapshot: PlanSnapshot) {
  if (snapshot.isPro || snapshot.usage.skills < FREE_LIMITS.skills) {
    return null;
  }
  return planLimitResponse(
    "SKILL_LIMIT",
    `Free includes ${FREE_LIMITS.skills} skills.`,
  );
}

export { isPro };
