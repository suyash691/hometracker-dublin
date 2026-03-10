import { calculateStampDuty } from "@/lib/stamp-duty";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const price = Number(req.nextUrl.searchParams.get("price") || 0);
  const newBuild = req.nextUrl.searchParams.get("newBuild") === "true";
  if (!price) return NextResponse.json({ error: "price required" }, { status: 400 });
  return NextResponse.json(calculateStampDuty(price, newBuild));
}
