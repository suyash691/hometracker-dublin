import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string; milestoneId: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { milestoneId } = await ctx.params;
  const body = await req.json();
  if (body.status === "completed" && !body.completedDate) body.completedDate = new Date();
  const m = await prisma.conveyancingMilestone.update({ where: { id: milestoneId }, data: body });
  return NextResponse.json(m);
}
