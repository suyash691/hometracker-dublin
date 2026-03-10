import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const estimates = await prisma.renovationEstimate.findMany({
    where: { houseId: id },
    orderBy: { generatedAt: "desc" },
  });
  return NextResponse.json(estimates);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const estimate = await prisma.renovationEstimate.create({
    data: { ...body, houseId: id },
  });
  return NextResponse.json(estimate, { status: 201 });
}
