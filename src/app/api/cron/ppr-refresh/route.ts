import { prisma } from "@/lib/db";
import { refreshComparables } from "@/lib/ppr";
import { NextResponse } from "next/server";

export async function POST() {
  const houses = await prisma.house.findMany({
    where: { status: { notIn: ["dropped", "closed"] } },
    select: { id: true },
  });
  let refreshed = 0;
  for (const h of houses) {
    try { await refreshComparables(h.id); refreshed++; } catch { /* skip */ }
  }
  return NextResponse.json({ ok: true, refreshed });
}
