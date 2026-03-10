import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  // body.templateId — use a template, or body.items for custom
  let items: { name: string; checked: boolean; notes: string }[];

  if (body.templateId) {
    const tpl = await prisma.checklistTemplate.findUnique({ where: { id: body.templateId } });
    if (!tpl) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    const names: string[] = JSON.parse(tpl.items);
    items = names.map((name) => ({ name, checked: false, notes: "" }));
  } else if (body.items) {
    items = body.items;
  } else {
    // Use default template
    const def = await prisma.checklistTemplate.findFirst({ where: { isDefault: true } });
    if (!def) return NextResponse.json({ error: "No default template" }, { status: 400 });
    const names: string[] = JSON.parse(def.items);
    items = names.map((name) => ({ name, checked: false, notes: "" }));
  }

  const checklist = await prisma.viewingChecklist.create({
    data: { houseId: id, items: JSON.stringify(items) },
  });
  return NextResponse.json(checklist, { status: 201 });
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const checklists = await prisma.viewingChecklist.findMany({
    where: { houseId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(checklists);
}
