import { prisma } from "@/lib/db";
import { refreshNeighbourhood, getTransitAccessibility } from "@/lib/neighbourhood";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const amenities = await prisma.nearbyAmenity.findMany({ where: { houseId: id }, include: { amenity: true }, orderBy: { distanceMetres: "asc" } });
  const commute = await prisma.commuteEstimate.findMany({ where: { houseId: id } });
  const transit = await getTransitAccessibility(id);
  // Add walkability status to each amenity
  const withStatus = amenities.map(a => ({
    ...a,
    walkable: a.distanceMetres <= a.amenity.maxWalkingMetres,
    status: a.distanceMetres <= a.amenity.maxWalkingMetres ? "walkable" : "not_walkable",
  }));
  return NextResponse.json({ amenities: withStatus, commute, transit });
}

export async function POST(_r: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await refreshNeighbourhood(id);
    // Return fresh data
    const amenities = await prisma.nearbyAmenity.findMany({ where: { houseId: id }, include: { amenity: true }, orderBy: { distanceMetres: "asc" } });
    const commute = await prisma.commuteEstimate.findMany({ where: { houseId: id } });
    const transit = await getTransitAccessibility(id);
    const withStatus = amenities.map(a => ({ ...a, walkable: a.distanceMetres <= a.amenity.maxWalkingMetres, status: a.distanceMetres <= a.amenity.maxWalkingMetres ? "walkable" : "not_walkable" }));
    return NextResponse.json({ amenities: withStatus, commute, transit });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
