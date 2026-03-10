import { calculateBorrowingLimits } from "@/lib/central-bank";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const income1 = Number(p.get("income1") || 0);
  const income2 = Number(p.get("income2") || 0);
  const ftb = p.get("ftb") !== "false";
  return NextResponse.json(calculateBorrowingLimits(income1, income2, ftb));
}
