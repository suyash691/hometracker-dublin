import { prisma } from "@/lib/db";
import { calculateStampDuty } from "@/lib/stamp-duty";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const tc = await prisma.totalCostEstimate.findUnique({ where: { houseId: id } });
  if (!tc) return NextResponse.json(null);

  const upfront = tc.deposit + tc.stampDuty + tc.legalFees + tc.landRegistryFees + tc.surveyFee + tc.valuationFee;
  const totalPurchase = upfront + tc.mortgageProtection + tc.homeInsurance + tc.movingCosts + tc.otherCosts;

  // Pull renovation estimates for true all-in cost
  const estimates = await prisma.renovationEstimate.findMany({ where: { houseId: id } });
  const renoLow = estimates.reduce((s, e) => s + (e.estimatedCostLow || 0), 0);
  const renoHigh = estimates.reduce((s, e) => s + (e.estimatedCostHigh || 0), 0);

  // Pull SEAI grants from BER impact if available
  const house = await prisma.house.findUnique({ where: { id } });
  let seaiGrants = 0;
  if (house?.ber && house.squareMetres) {
    const { calculateBerImpact } = await import("@/lib/ber-calculator");
    seaiGrants = calculateBerImpact(house.ber, house.squareMetres).seaiGrantsAvailable;
  }

  return NextResponse.json({
    ...tc,
    cashNeededAtClosing: Math.round(upfront),
    totalPurchaseCost: Math.round(totalPurchase),
    renovationLow: Math.round(renoLow),
    renovationHigh: Math.round(renoHigh),
    seaiGrants: Math.round(seaiGrants),
    trueAllInLow: Math.round(totalPurchase + Math.max(0, renoLow - seaiGrants)),
    trueAllInHigh: Math.round(totalPurchase + Math.max(0, renoHigh - seaiGrants)),
  });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
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
