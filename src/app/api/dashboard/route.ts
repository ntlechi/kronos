import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/dashboard";
import { getTenantContext } from "@/lib/tenant";
import type { Period } from "@/lib/types";

const PERIODS: Period[] = ["day", "week", "month", "year"];

export async function GET(request: Request) {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("period") ?? "week";
  const period = PERIODS.includes(raw as Period)
    ? (raw as Period)
    : "week";

  const summary = await getDashboard(ctx.tenantId, period, ctx.plan);
  return NextResponse.json({
    summary,
    plan: ctx.planSnapshot,
    historyCapped: !ctx.planSnapshot.isPro && period === "year",
  });
}
