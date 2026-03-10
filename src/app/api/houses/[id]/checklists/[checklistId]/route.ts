import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string; checklistId: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { checklistId } = await ctx.params;
  const body = await req.json();
  if (Array.isArray(body.items)) body.items = JSON.stringify(body.items);
  const checklist = await prisma.viewingChecklist.update({
    where: { id: checklistId },
    data: body,
  });
  return NextResponse.json(checklist);
}
