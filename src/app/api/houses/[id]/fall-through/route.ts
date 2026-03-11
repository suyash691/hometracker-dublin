import { prisma } from "@/lib/db";
import { handleDropped } from "@/lib/status-triggers";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json(await prisma.fallThroughRecord.findMany({ where: { houseId: id } }));
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  await prisma.fallThroughRecord.create({ data: { houseId: id, ...body } });
  // Create journal entry BEFORE status change (handleDropped checks current status)
  await handleDropped(id);
  await prisma.house.update({ where: { id }, data: { status: "dropped" } });
  await prisma.actionItem.create({ data: { houseId: id, title: "Review what went wrong", category: "other", status: "todo" } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
