import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";

export async function GET() {
  const ctx = await getTenantContext();
  if (!ctx.ok) return ctx.response;
  return NextResponse.json({ plan: ctx.planSnapshot });
}
