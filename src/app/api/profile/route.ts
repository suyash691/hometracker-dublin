import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const profile = await prisma.buyerProfile.findFirst();
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.buyerProfile.findFirst();
  const profile = existing
    ? await prisma.buyerProfile.update({ where: { id: existing.id }, data: body })
    : await prisma.buyerProfile.create({ data: body });
  return NextResponse.json(profile);
}
