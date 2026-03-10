import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string; exId: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { exId } = await ctx.params;
  const body = await req.json();
  return NextResponse.json(await prisma.mortgageExemption.update({ where: { id: exId }, data: body }));
}
