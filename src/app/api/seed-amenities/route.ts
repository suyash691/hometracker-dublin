import { prisma } from "@/lib/db";
import { DEFAULT_AMENITIES } from "@/lib/default-amenities";
import { NextResponse } from "next/server";
export async function POST() {
  const existing = await prisma.preferredAmenity.count();
  if (existing > 0) return NextResponse.json({ message: "Already seeded" });
  await prisma.preferredAmenity.createMany({ data: DEFAULT_AMENITIES });
  return NextResponse.json({ message: "Seeded", count: DEFAULT_AMENITIES.length }, { status: 201 });
}
