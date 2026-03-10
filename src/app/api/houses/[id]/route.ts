import { prisma } from "@/lib/db";
import { CONVEYANCING_MILESTONES } from "@/lib/schemes";
import { calculateStampDuty } from "@/lib/stamp-duty";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const house = await prisma.house.findUnique({
    where: { id },
    include: {
      media: true,
      bids: { orderBy: { bidDate: "desc" } },
      actionItems: { orderBy: { dueDate: "asc" } },
      renovationEstimates: true,
      viewingChecklists: true,
      totalCostEstimate: true,
      conveyancing: { include: { milestones: { orderBy: { stepOrder: "asc" } } } },
      apartmentDetails: true,
      defectiveBlocks: true,
    },
  });
  if (!house) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(house);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  if (Array.isArray(body.pros)) body.pros = JSON.stringify(body.pros);
  if (Array.isArray(body.cons)) body.cons = JSON.stringify(body.cons);

  // If status changing to sale_agreed, auto-create conveyancing
  if (body.status === "sale_agreed") {
    const existing = await prisma.conveyancingTracker.findUnique({ where: { houseId: id } });
    if (!existing) {
      await prisma.conveyancingTracker.create({
        data: {
          houseId: id,
          milestones: { create: CONVEYANCING_MILESTONES.map((step, i) => ({ step, stepOrder: i + 1 })) },
        },
      });
      const house = await prisma.house.findUnique({ where: { id } });
      if (house?.askingPrice) {
        const { stampDuty } = calculateStampDuty(house.askingPrice, false);
        await prisma.totalCostEstimate.upsert({
          where: { houseId: id },
          update: {},
          create: { houseId: id, purchasePrice: house.askingPrice, deposit: Math.round(house.askingPrice * 0.1), stampDuty },
        });
      }
      for (const a of [
        { title: "Appoint solicitor", category: "legal" },
        { title: "Arrange structural survey", category: "survey" },
        { title: "Confirm mortgage drawdown timeline", category: "mortgage" },
        { title: "Get home insurance quotes", category: "insurance" },
      ]) {
        await prisma.actionItem.create({ data: { ...a, houseId: id, status: "todo" } });
      }
    }
  }

  const house = await prisma.house.update({ where: { id }, data: body });
  return NextResponse.json(house);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.house.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
