import { prisma } from "@/lib/db";
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
  await prisma.house.update({ where: { id }, data: { status: "dropped" } });
  await prisma.actionItem.create({ data: { houseId: id, title: "Review what went wrong", category: "other", status: "todo" } });
  await prisma.journalEntry.create({
    data: { houseId: id, type: "milestone", content: "💔 Sale fell through. It's okay — the average Dublin buyer bids on 6 properties." },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
