import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string; findingId: string }> };
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { findingId } = await ctx.params;
  return NextResponse.json(await prisma.surveyFinding.update({ where: { id: findingId }, data: await req.json() }));
}
export async function DELETE(_r: NextRequest, ctx: Ctx) {
  const { findingId } = await ctx.params;
  await prisma.surveyFinding.delete({ where: { id: findingId } });
  return NextResponse.json({ ok: true });
}
