import { prisma } from "@/lib/db";
import { calculateHTB, calculateFHS, calculateLAHL } from "@/lib/schemes";
import { NextResponse } from "next/server";

export async function GET() {
  const profile = await prisma.buyerProfile.findFirst();
  if (!profile) return NextResponse.json({ error: "Set up your buyer profile first" }, { status: 400 });

  const ftb = profile.isFirstTimeBuyer;
  const tax = profile.taxPaid4Years1 + profile.taxPaid4Years2;
  // Use a sample price for general eligibility; per-house calcs happen on house detail
  const htb = calculateHTB(ftb, true, 400_000, tax);
  const fhs = calculateFHS(ftb, true, 400_000, htb.eligible);
  const lahl = calculateLAHL(profile.grossIncome1, profile.grossIncome2, ftb);

  return NextResponse.json({ htb, fhs, lahl });
}
