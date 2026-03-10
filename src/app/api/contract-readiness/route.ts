import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export async function GET() {
  const profile = await prisma.buyerProfile.findFirst();
  const mortgage = await prisma.mortgageTracker.findFirst({ where: { status: { in: ["approval_in_principle", "full_approval"] } }, orderBy: { approvalExpiry: "desc" } });
  const conv = await prisma.conveyancingTracker.findFirst({ where: { solicitorName: { not: null } } });
  const cr = await prisma.contractReadiness.findFirst();
  const items = [
    { item: "Mortgage AIP valid", status: !!(mortgage?.approvalExpiry && new Date(mortgage.approvalExpiry) > new Date()), auto: true, detail: mortgage?.approvalExpiry ? `Expires ${new Date(mortgage.approvalExpiry).toLocaleDateString("en-IE")}` : "No AIP" },
    { item: "Solicitor appointed", status: !!conv?.solicitorName, auto: true, detail: conv?.solicitorName || "Not yet" },
    { item: "Proof of funds", status: (profile?.totalSavings || 0) > 0, auto: true, detail: profile ? `€${profile.totalSavings.toLocaleString()} savings` : "No profile" },
    { item: "ID verified", status: cr?.idVerified || false, auto: false },
    { item: "AML docs submitted", status: cr?.amlDocsSubmitted || false, auto: false },
    { item: "Surveyor on standby", status: cr?.surveyorOnStandby || false, auto: false },
    { item: "Broker engaged", status: cr?.brokerEngaged || false, auto: false },
  ];
  return NextResponse.json({ items, readyPct: Math.round((items.filter(i => i.status).length / items.length) * 100) });
}
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.contractReadiness.findFirst();
  const cr = existing
    ? await prisma.contractReadiness.update({ where: { id: existing.id }, data: body })
    : await prisma.contractReadiness.create({ data: body });
  return NextResponse.json(cr);
}
