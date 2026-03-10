import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string; snagId: string }> };
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { snagId } = await ctx.params;
  return NextResponse.json(await prisma.snagItem.update({ where: { id: snagId }, data: await req.json() }));
}
