import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const SINGLETON_ID = "buyer-profile-singleton";

export async function GET() {
  const profile = await prisma.buyerProfile.findUnique({ where: { id: SINGLETON_ID } });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  // Enforce singleton — always use the same ID
  const profile = await prisma.buyerProfile.upsert({
    where: { id: SINGLETON_ID },
    update: body,
    create: { id: SINGLETON_ID, ...body },
  });
  return NextResponse.json(profile);
}
