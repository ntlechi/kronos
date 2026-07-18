import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

const updateSchema = z.object({
  focusMinutes: z.number().int().min(1).max(180).optional(),
  breakMinutes: z.number().int().min(1).max(60).optional(),
  longBreakMinutes: z.number().int().min(1).max(90).optional(),
  cyclesBeforeLong: z.number().int().min(1).max(12).optional(),
});

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const prefs = await prisma.pomodoroPrefs.findUnique({
    where: { tenantId },
  });
  return NextResponse.json({
    prefs: prefs ?? {
      focusMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      cyclesBeforeLong: 4,
    },
  });
}

export async function PATCH(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  const { tenantId } = ctx;
  const body = updateSchema.parse(await request.json());

  const prefs = await prisma.pomodoroPrefs.upsert({
    where: { tenantId },
    update: body,
    create: {
      tenantId,
      focusMinutes: body.focusMinutes ?? 25,
      breakMinutes: body.breakMinutes ?? 5,
      longBreakMinutes: body.longBreakMinutes ?? 15,
      cyclesBeforeLong: body.cyclesBeforeLong ?? 4,
    },
  });

  return NextResponse.json({ prefs });
}
