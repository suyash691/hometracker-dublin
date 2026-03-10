/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/mortgage/route";
import { PUT, GET as GET_DOCS } from "@/app/api/mortgage/[id]/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const mockMortgage = { id: "m1", lender: "AIB", status: "researching", documents: [] };

beforeEach(() => jest.clearAllMocks());

describe("GET /api/mortgage", () => {
  it("returns mortgages with documents", async () => {
    (prisma.mortgageTracker.findMany as jest.Mock).mockResolvedValue([mockMortgage]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });
});

describe("POST /api/mortgage", () => {
  it("creates a mortgage", async () => {
    (prisma.mortgageTracker.create as jest.Mock).mockResolvedValue(mockMortgage);
    const req = new NextRequest("http://localhost", {
      method: "POST", body: JSON.stringify({ lender: "AIB" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("PUT /api/mortgage/[id]", () => {
  it("updates a mortgage", async () => {
    (prisma.mortgageTracker.update as jest.Mock).mockResolvedValue({ ...mockMortgage, status: "submitted" });
    const req = new NextRequest("http://localhost", {
      method: "PUT", body: JSON.stringify({ status: "submitted" }),
    });
    const res = await PUT(req, ctx("m1"));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/mortgage/[id] (documents)", () => {
  it("returns documents for a mortgage", async () => {
    (prisma.mortgageDocument.findMany as jest.Mock).mockResolvedValue([{ id: "d1", name: "P60" }]);
    const res = await GET_DOCS(new NextRequest("http://localhost"), ctx("m1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });
});
