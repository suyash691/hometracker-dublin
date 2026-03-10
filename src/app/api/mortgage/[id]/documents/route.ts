import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET docs for a mortgage, POST to seed default Irish docs
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const docs = await prisma.mortgageDocument.findMany({ where: { mortgageId: id } });
  return NextResponse.json(docs);
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const mortgage = await prisma.mortgageTracker.findUnique({ where: { id } });
  if (!mortgage) return NextResponse.json({ error: "Mortgage not found" }, { status: 404 });

  // Check if docs already seeded
  const existing = await prisma.mortgageDocument.count({ where: { mortgageId: id } });
  if (existing > 0) return NextResponse.json({ message: "Documents already seeded" });

  const DEFAULT_DOCS = [
    { name: "Employment Detail Summary", required: true, perPerson: true },
    { name: "Salary Certificates (3 months)", required: true, perPerson: true },
    { name: "Bank Statements (6 months)", required: true, perPerson: true },
    { name: "Savings Account Statements (6 months)", required: true, perPerson: true },
    { name: "Photo ID (Passport/Driving Licence)", required: true, perPerson: true },
    { name: "Proof of Address (Utility Bill)", required: true, perPerson: true },
    { name: "Statement of Affairs", required: true, perPerson: false },
    { name: "Signed Mortgage Application Form", required: true, perPerson: false },
    { name: "Gift Letter (if applicable)", required: false, perPerson: false },
    { name: "Existing Loan Statements", required: false, perPerson: true },
    { name: "Landlord Reference / Rent Receipts (12 months)", required: false, perPerson: false },
    { name: "Tax Clearance / Revenue Statement", required: false, perPerson: true },
    { name: "Life Insurance Quote", required: false, perPerson: false },
    { name: "Home Insurance Quote", required: false, perPerson: false },
    { name: "Valuation Report", required: true, perPerson: false },
    { name: "Solicitor Undertaking Letter", required: true, perPerson: false },
  ];

  await prisma.mortgageDocument.createMany({
    data: DEFAULT_DOCS.map((d) => ({
      mortgageId: id,
      name: d.name,
      required: d.required,
      perPerson: d.perPerson,
      uploaded: false,
    })),
  });

  const docs = await prisma.mortgageDocument.findMany({ where: { mortgageId: id } });
  return NextResponse.json(docs, { status: 201 });
}
