import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json(await prisma.preferredAmenity.findMany({ orderBy: { name: "asc" } }));
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(await prisma.preferredAmenity.create({ data: { ...body, isCustom: true } }), { status: 201 });
}
