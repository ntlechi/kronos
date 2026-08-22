import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { loadPlanSnapshot } from "@/lib/billing/enforce";
import { normalizePlan, type PlanId, type PlanSnapshot } from "@/lib/billing/plan";
import { prisma } from "@/lib/prisma";

export class AuthTenantError extends Error {
  status: number;

  constructor(message: "Unauthorized" | "Forbidden") {
    super(message);
    this.name = "AuthTenantError";
    this.status = message === "Unauthorized" ? 401 : 403;
  }
}

/** Authenticated workspace isolation — every API must use this. */
export async function requireTenantId(): Promise<{
  userId: string;
  tenantId: string;
  plan: PlanId;
  planSnapshot: PlanSnapshot;
}> {
  const session = await auth();
  const userId = session?.user?.id;
  const tenantId = session?.user?.tenantId;

  if (!userId || !tenantId) {
    throw new AuthTenantError("Unauthorized");
  }

  const membership = await prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: { tenantId, userId },
    },
    select: { id: true, tenant: { select: { plan: true } } },
  });

  if (!membership) {
    throw new AuthTenantError("Forbidden");
  }

  const planSnapshot = await loadPlanSnapshot(tenantId, userId);

  return {
    userId,
    tenantId,
    plan: normalizePlan(membership.tenant.plan),
    planSnapshot,
  };
}

export async function getTenantContext() {
  try {
    const ctx = await requireTenantId();
    return { ok: true as const, ...ctx };
  } catch (error) {
    if (error instanceof AuthTenantError) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: error.message },
          { status: error.status },
        ),
      };
    }
    throw error;
  }
}
