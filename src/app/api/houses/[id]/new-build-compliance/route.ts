import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json(await prisma.newBuildCompliance.findUnique({ where: { houseId: id } }));
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  return NextResponse.json(await prisma.newBuildCompliance.upsert({ where: { houseId: id }, update: body, create: { houseId: id, ...body } }));
}
