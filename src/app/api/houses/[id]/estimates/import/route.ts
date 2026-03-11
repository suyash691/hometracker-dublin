import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// POST with JSON array: [{"item":"Kitchen","estimatedCostLow":8000,"estimatedCostHigh":15000,"notes":"..."}]
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();

  if (!Array.isArray(body)) return NextResponse.json({ error: "Expected JSON array of estimates" }, { status: 400 });

  const created = await Promise.all(
    body.map((e: Record<string, unknown>) =>
      prisma.renovationEstimate.create({
        data: {
          houseId: id,
          item: String(e.item || ""),
          estimatedCostLow: Number(e.estimatedCostLow) || undefined,
          estimatedCostHigh: Number(e.estimatedCostHigh) || undefined,
          source: "ai_generated",
          notes: e.notes ? String(e.notes) : undefined,
        },
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}
