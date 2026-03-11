import { prisma } from "@/lib/db";
import { OMC_CHECKLIST } from "@/lib/constants/omc";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json(await prisma.apartmentDetails.findUnique({ where: { houseId: id } }));
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const apt = await prisma.apartmentDetails.upsert({
    where: { houseId: id },
    update: body,
    create: {
      houseId: id,
      omcChecklist: JSON.stringify(OMC_CHECKLIST.map(name => ({ name, checked: false, notes: "" }))),
      ...body,
    },
  });
  return NextResponse.json(apt);
}
