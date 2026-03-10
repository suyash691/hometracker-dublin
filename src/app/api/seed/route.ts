import { prisma } from "@/lib/db";
import { DEFAULT_CHECKLIST_ITEMS } from "@/lib/default-checklist";
import { NextResponse } from "next/server";

export async function POST() {
  const existing = await prisma.checklistTemplate.findFirst({ where: { isDefault: true } });
  if (existing) {
    return NextResponse.json({ message: "Default template already exists", id: existing.id });
  }

  const template = await prisma.checklistTemplate.create({
    data: {
      name: "Dublin Viewing Checklist (Default)",
      items: JSON.stringify(DEFAULT_CHECKLIST_ITEMS),
      isDefault: true,
    },
  });
  return NextResponse.json({ message: "Seeded default checklist template", id: template.id }, { status: 201 });
}
