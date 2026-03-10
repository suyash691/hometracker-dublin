import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const houseId = req.nextUrl.searchParams.get("houseId");
  const professional = req.nextUrl.searchParams.get("professional");
  const where: Record<string, string> = {};
  if (houseId) where.houseId = houseId;
  if (professional) where.professional = professional;
  return NextResponse.json(await prisma.commLog.findMany({ where, orderBy: { createdAt: "desc" } }));
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(await prisma.commLog.create({ data: body }), { status: 201 });
}
