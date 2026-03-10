import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json(await prisma.biddingStrategy.findUnique({ where: { houseId: id } }));
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const bs = await prisma.biddingStrategy.upsert({ where: { houseId: id }, update: body, create: { houseId: id, ...body } });
  return NextResponse.json(bs);
}
