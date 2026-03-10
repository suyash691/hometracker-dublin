import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const mortgage = await prisma.mortgageTracker.update({ where: { id }, data: body });
  return NextResponse.json(mortgage);
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const docs = await prisma.mortgageDocument.findMany({ where: { mortgageId: id } });
  return NextResponse.json(docs);
}
