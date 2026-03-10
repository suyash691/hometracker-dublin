import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
  });
  return NextResponse.json(logs);
}
