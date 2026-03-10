import { prisma } from "@/lib/db";
import { DEFAULT_SNAG_ITEMS } from "@/lib/default-snags";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json(await prisma.snagItem.findMany({ where: { houseId: id }, orderBy: { room: "asc" } }));
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  if (body.seedDefaults) {
    const existing = await prisma.snagItem.count({ where: { houseId: id } });
    if (existing === 0) {
      const items = DEFAULT_SNAG_ITEMS.flatMap(g => g.items.map(desc => ({ houseId: id, room: g.room, category: "functional", description: desc })));
      await prisma.snagItem.createMany({ data: items });
    }
    return NextResponse.json(await prisma.snagItem.findMany({ where: { houseId: id }, orderBy: { room: "asc" } }));
  }
  return NextResponse.json(await prisma.snagItem.create({ data: { houseId: id, ...body } }), { status: 201 });
}
