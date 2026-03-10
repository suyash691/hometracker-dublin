import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const schemes = await prisma.schemeTracker.findMany();
  return NextResponse.json(schemes);
}
