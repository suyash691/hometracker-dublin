import { prisma } from "@/lib/db";
import { generateRenovationEstimates } from "@/lib/estimator";
import { logActivity } from "@/lib/activity";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const house = await prisma.house.findUnique({ where: { id } });
  if (!house) return NextResponse.json({ error: "House not found" }, { status: 404 });

  if (!house.notes && !house.pros && !house.cons) {
    return NextResponse.json(
      { error: "Add notes, pros, or cons to the house first so the AI has context for estimates" },
      { status: 400 }
    );
  }

  try {
    const estimates = await generateRenovationEstimates(house);

    const created = await Promise.all(
      estimates.map((e) =>
        prisma.renovationEstimate.create({
          data: {
            houseId: id,
            item: e.item,
            estimatedCostLow: e.estimatedCostLow,
            estimatedCostHigh: e.estimatedCostHigh,
            source: "ai_generated",
            notes: e.notes,
          },
        })
      )
    );

    await logActivity("system", "generated_estimates", "house", id, `AI generated ${created.length} estimates`);

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Estimate generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
