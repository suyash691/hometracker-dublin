import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const mortgages = await prisma.mortgageTracker.findMany({
    include: { documents: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(mortgages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const mortgage = await prisma.mortgageTracker.create({ data: body });
  return NextResponse.json(mortgage, { status: 201 });
}
