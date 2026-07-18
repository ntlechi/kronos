import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { provisionWorkspace } from "@/lib/auth/provision";
import { subscribeToKit } from "@/lib/kit";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  marketingOptIn: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    let kitSubscriberId: string | null = null;
    if (body.marketingOptIn) {
      const kit = await subscribeToKit({
        email,
        firstName: body.name,
      });
      if (kit.ok && kit.subscriberId) {
        kitSubscriberId = kit.subscriberId;
      }
      // Don't block account creation if Kit is misconfigured
    }

    const { user, tenant } = await provisionWorkspace({
      email,
      name: body.name,
      password: body.password,
      marketingOptIn: body.marketingOptIn,
      kitSubscriberId,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          marketingOptIn: user.marketingOptIn,
        },
        tenant: { id: tenant.id, slug: tenant.slug },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
