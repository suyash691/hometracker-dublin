import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ scheme: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { scheme } = await ctx.params;
  const body = await req.json();
  const record = await prisma.schemeTracker.upsert({
    where: { scheme },
    update: body,
    create: { scheme, ...body },
  });
  return NextResponse.json(record);
}
