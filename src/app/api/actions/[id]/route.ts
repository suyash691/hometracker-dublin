import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const item = await prisma.actionItem.update({ where: { id }, data: body });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.actionItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
