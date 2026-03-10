import { prisma } from "@/lib/db";
import { refreshNeighbourhood } from "@/lib/neighbourhood";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const amenities = await prisma.nearbyAmenity.findMany({ where: { houseId: id }, include: { amenity: true }, orderBy: { distanceMetres: "asc" } });
  const commute = await prisma.commuteEstimate.findMany({ where: { houseId: id } });
  return NextResponse.json({ amenities, commute });
}
export async function POST(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const result = await refreshNeighbourhood(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
