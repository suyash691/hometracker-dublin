import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json(await prisma.mortgageExemption.findMany({ where: { mortgageId: id } }));
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const ex = await prisma.mortgageExemption.create({ data: { mortgageId: id, ...body } });
  return NextResponse.json(ex, { status: 201 });
}
