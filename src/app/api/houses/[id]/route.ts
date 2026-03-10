import { prisma } from "@/lib/db";
import { handleSaleAgreed, handleClosed, handleDropped } from "@/lib/status-triggers";
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

  if (body.status === "sale_agreed") await handleSaleAgreed(id);
  if (body.status === "closed") await handleClosed(id);
  if (body.status === "dropped") await handleDropped(id);

  const house = await prisma.house.update({ where: { id }, data: body });
  return NextResponse.json(house);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.house.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
