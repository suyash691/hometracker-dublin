import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const houseId = req.nextUrl.searchParams.get("houseId");
  const status = req.nextUrl.searchParams.get("status");
  const assignedTo = req.nextUrl.searchParams.get("assignedTo");
  const where: Record<string, string> = {};
  if (houseId) where.houseId = houseId;
  if (status) where.status = status;
  if (assignedTo) where.assignedTo = assignedTo;

  const items = await prisma.actionItem.findMany({
    where,
    include: { house: { select: { address: true } } },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.actionItem.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}
