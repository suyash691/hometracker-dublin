import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const houseId = req.nextUrl.searchParams.get("houseId");
  const where = houseId ? { houseId } : {};
  return NextResponse.json(await prisma.journalEntry.findMany({ where, orderBy: { createdAt: "desc" }, include: { house: { select: { address: true } } } }));
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(await prisma.journalEntry.create({ data: body }), { status: 201 });
}
