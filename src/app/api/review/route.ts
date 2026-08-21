import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/dashboard";
import { buildWeeklyReview } from "@/lib/review";
import { getTenantContext } from "@/lib/tenant";

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;

  const summary = await getDashboard(ctx.tenantId, "week");
  const review = buildWeeklyReview(summary);
  return NextResponse.json({ review });
}
