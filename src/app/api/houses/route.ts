import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const neighbourhood = req.nextUrl.searchParams.get("neighbourhood");
  const where: Record<string, string> = {};
  if (status) where.status = status;
  if (neighbourhood) where.neighbourhood = neighbourhood;

  const houses = await prisma.house.findMany({
    where,
    include: { bids: { orderBy: { bidDate: "desc" }, take: 1 }, media: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(houses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Ensure pros/cons are stored as JSON strings
  if (Array.isArray(body.pros)) body.pros = JSON.stringify(body.pros);
  if (Array.isArray(body.cons)) body.cons = JSON.stringify(body.cons);

  const house = await prisma.house.create({ data: body });
  return NextResponse.json(house, { status: 201 });
}
