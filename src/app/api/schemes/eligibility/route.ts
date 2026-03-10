import { prisma } from "@/lib/db";
import { calculateHTB, calculateFHS, calculateLAHL } from "@/lib/schemes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const profile = await prisma.buyerProfile.findFirst();
  if (!profile) return NextResponse.json({ error: "Set up your buyer profile first" }, { status: 400 });

  const ftb = profile.isFirstTimeBuyer;
  const tax = profile.taxPaid4Years1 + profile.taxPaid4Years2;
  const price = Number(req.nextUrl.searchParams.get("price")) || 400_000;
  const htb = calculateHTB(ftb, true, price, tax);
  const fhs = calculateFHS(ftb, true, price, htb.eligible);
  const lahl = calculateLAHL(profile.grossIncome1, profile.grossIncome2, ftb);

  return NextResponse.json({ htb, fhs, lahl });
}
