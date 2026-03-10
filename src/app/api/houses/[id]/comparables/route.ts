import { refreshComparables } from "@/lib/ppr";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const { prisma } = await import("@/lib/db");
  return NextResponse.json(await prisma.pPRComparable.findUnique({ where: { houseId: id } }));
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const record = await refreshComparables(id);
    return NextResponse.json(record);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
