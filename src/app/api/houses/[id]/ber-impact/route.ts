import { prisma } from "@/lib/db";
import { calculateBerImpact } from "@/lib/ber-calculator";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const house = await prisma.house.findUnique({ where: { id } });
  if (!house?.ber || !house.squareMetres) return NextResponse.json(null);
  return NextResponse.json(calculateBerImpact(house.ber, house.squareMetres, house.askingPrice || undefined));
}
