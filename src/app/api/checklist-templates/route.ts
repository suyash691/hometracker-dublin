import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const templates = await prisma.checklistTemplate.findMany({
    orderBy: { isDefault: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (Array.isArray(body.items)) body.items = JSON.stringify(body.items);
  const template = await prisma.checklistTemplate.create({ data: body });
  return NextResponse.json(template, { status: 201 });
}
