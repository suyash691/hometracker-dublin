import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json(await prisma.defectiveBlocksAssessment.findUnique({ where: { houseId: id } }));
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const db = await prisma.defectiveBlocksAssessment.upsert({
    where: { houseId: id },
    update: body,
    create: { houseId: id, ...body },
  });
  return NextResponse.json(db);
}
