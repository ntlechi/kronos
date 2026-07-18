import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

const createSchema = z.object({
  projectId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().max(300).optional(),
  spentAt: z.string().datetime().optional(),
  currency: z.string().default("CAD"),
});

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const expenses = await prisma.expenseLog.findMany({
    where: { tenantId },
    include: {
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: { spentAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ expenses });
}

export async function POST(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const body = createSchema.parse(await request.json());

  const project = await prisma.project.findFirst({
    where: { id: body.projectId, tenantId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const expense = await prisma.expenseLog.create({
    data: {
      tenantId,
      projectId: body.projectId,
      amountCents: Math.round(body.amount * 100),
      currency: body.currency,
      description: body.description,
      spentAt: body.spentAt ? new Date(body.spentAt) : new Date(),
    },
  });

  return NextResponse.json({ expense }, { status: 201 });
}
