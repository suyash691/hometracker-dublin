import { prisma } from "@/lib/db";
import { CONVEYANCING_MILESTONES } from "@/lib/schemes";
import { calculateStampDuty } from "@/lib/stamp-duty";
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
  const existing = await prisma.conveyancingTracker.findUnique({ where: { houseId: id } });
  if (existing) return NextResponse.json(existing);

  const conv = await prisma.conveyancingTracker.create({
    data: {
      houseId: id,
      milestones: {
        create: CONVEYANCING_MILESTONES.map((step, i) => ({ step, stepOrder: i + 1 })),
      },
    },
    include: { milestones: { orderBy: { stepOrder: "asc" } } },
  });

  // Auto-create total cost estimate
  const house = await prisma.house.findUnique({ where: { id } });
  if (house?.askingPrice) {
    const { stampDuty } = calculateStampDuty(house.askingPrice, false);
    await prisma.totalCostEstimate.upsert({
      where: { houseId: id },
      update: {},
      create: { houseId: id, purchasePrice: house.askingPrice, deposit: Math.round(house.askingPrice * 0.1), stampDuty },
    });
  }

  // Auto-create action items
  const actions = [
    { title: "Appoint solicitor", category: "legal" },
    { title: "Arrange structural survey", category: "survey" },
    { title: "Confirm mortgage drawdown timeline", category: "mortgage" },
    { title: "Get home insurance quotes", category: "insurance" },
  ];
  for (const a of actions) {
    await prisma.actionItem.create({ data: { ...a, houseId: id, status: "todo" } });
  }

  return NextResponse.json(conv, { status: 201 });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const conv = await prisma.conveyancingTracker.update({ where: { houseId: id }, data: body });
  return NextResponse.json(conv);
}
