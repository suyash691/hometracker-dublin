import { prisma } from "@/lib/db";
import { handleSaleAgreed } from "@/lib/status-triggers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conv = await prisma.conveyancingTracker.findUnique({
    where: { houseId: id },
    include: { milestones: { orderBy: { stepOrder: "asc" } } },
  });
  return NextResponse.json(conv);
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await handleSaleAgreed(id); // reuses shared logic, idempotent
  const conv = await prisma.conveyancingTracker.findUnique({
    where: { houseId: id },
    include: { milestones: { orderBy: { stepOrder: "asc" } } },
  });
  return NextResponse.json(conv, { status: conv ? 201 : 200 });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const conv = await prisma.conveyancingTracker.update({ where: { houseId: id }, data: body });
  return NextResponse.json(conv);
}
