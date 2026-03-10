/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/houses/[id]/survey-findings/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Survey Findings API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns findings", async () => {
    prisma.surveyFinding.findMany.mockResolvedValue([{ id: "f1", category: "structural" }]);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toHaveLength(1);
  });
  it("POST creates finding", async () => {
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ category: "structural", location: "attic", description: "Sagging beam" }) });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    expect(prisma.surveyFinding.create).toHaveBeenCalled();
  });
});
