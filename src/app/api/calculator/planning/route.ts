import { checkPlanningExemption } from "@/lib/planning";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const type = p.get("type") || "";
  const size = Number(p.get("size") || 0);
  const garden = p.get("gardenSize") ? Number(p.get("gardenSize")) : undefined;
  return NextResponse.json(checkPlanningExemption(type, size, garden));
}
