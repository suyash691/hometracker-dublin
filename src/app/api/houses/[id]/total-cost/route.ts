import { prisma } from "@/lib/db";
import { calculateStampDuty } from "@/lib/stamp-duty";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const tc = await prisma.totalCostEstimate.findUnique({ where: { houseId: id } });
  if (!tc) return NextResponse.json(null);
  const upfront = tc.deposit + tc.stampDuty + tc.legalFees + tc.landRegistryFees + tc.surveyFee + tc.valuationFee;
  return NextResponse.json({ ...tc, totalUpfront: Math.round(upfront), cashNeededAtClosing: Math.round(upfront) });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  // Auto-calc stamp duty if price provided but no stampDuty
  if (body.purchasePrice && !body.stampDuty) {
    const house = await prisma.house.findUnique({ where: { id } });
    const { stampDuty } = calculateStampDuty(body.purchasePrice, house?.isNewBuild ?? false);
    body.stampDuty = stampDuty;
    body.deposit = body.deposit ?? Math.round(body.purchasePrice * 0.1);
  }
  const tc = await prisma.totalCostEstimate.upsert({
    where: { houseId: id },
    update: body,
    create: { houseId: id, ...body },
  });
  return NextResponse.json(tc);
}
