import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ commId: string }> };
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { commId } = await ctx.params;
  const body = await req.json();
  return NextResponse.json(await prisma.commLog.update({ where: { id: commId }, data: body }));
}
