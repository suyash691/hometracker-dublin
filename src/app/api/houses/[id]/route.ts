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
      biddingStrategy: true,
      sellerIntel: true,
      newBuildCompliance: true,
      surveyFindings: true,
      snagItems: { orderBy: { room: "asc" } },
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
      // Auto-create new build compliance + snagging if new build
      if (house?.isNewBuild) {
        await prisma.newBuildCompliance.upsert({ where: { houseId: id }, update: {}, create: { houseId: id } });
        const { DEFAULT_SNAG_ITEMS } = await import("@/lib/default-snags");
        const snags = DEFAULT_SNAG_ITEMS.flatMap(g => g.items.map(desc => ({ houseId: id, room: g.room, category: "functional" as const, description: desc })));
        await prisma.snagItem.createMany({ data: snags });
      }
    }
  }

  // Auto-create post-completion checklist when closed
  if (body.status === "closed") {
    const { POST_COMPLETION_ITEMS } = await import("@/lib/default-post-completion");
    const existing = await prisma.viewingChecklist.findFirst({ where: { houseId: id, items: { contains: "MPRN" } } });
    if (!existing) {
      await prisma.viewingChecklist.create({
        data: { houseId: id, items: JSON.stringify(POST_COMPLETION_ITEMS.map(name => ({ name, checked: false, notes: "" }))) },
      });
    }
    await prisma.journalEntry.create({ data: { houseId: id, type: "milestone", content: "🏠 Congratulations! You got the keys!" } });
  }

  // Record fall-through when dropping from sale_agreed+
  if (body.status === "dropped") {
    const current = await prisma.house.findUnique({ where: { id } });
    if (current && ["sale_agreed", "conveyancing", "closing"].includes(current.status)) {
      await prisma.journalEntry.create({ data: { houseId: id, type: "milestone", content: "💔 Sale fell through. It's okay — the average Dublin buyer bids on 6 properties." } });
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
