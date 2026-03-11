import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const bids = await prisma.bidHistory.findMany({
    where: { houseId: id },
    orderBy: { bidDate: "desc" },
  });
  return NextResponse.json(bids);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const bid = await prisma.bidHistory.create({
    data: { ...body, houseId: id },
  });
  // Update house currentBid if this is the highest
  const highest = await prisma.bidHistory.findFirst({
    where: { houseId: id },
    orderBy: { amount: "desc" },
  });
  if (highest) {
    await prisma.house.update({ where: { id }, data: { currentBid: highest.amount } });
    // Auto-recalculate total cost if one exists
    const tc = await prisma.totalCostEstimate.findUnique({ where: { houseId: id } });
    if (tc) {
      const house = await prisma.house.findUnique({ where: { id } });
      const price = highest.amount;
      const { calculateStampDuty } = await import("@/lib/stamp-duty");
      const { stampDuty } = calculateStampDuty(price, house?.isNewBuild ?? false);
      await prisma.totalCostEstimate.update({
        where: { houseId: id },
        data: { purchasePrice: price, deposit: Math.round(price * 0.1), stampDuty },
      });
    }
  }
  return NextResponse.json(bid, { status: 201 });
}
