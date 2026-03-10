/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/defective-blocks/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
describe("Defective Blocks API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns assessment", async () => {
    (prisma.defectiveBlocksAssessment.findUnique as jest.Mock).mockResolvedValue({ id: "d1", pyriteTestResult: "not_tested" });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect((await res.json()).pyriteTestResult).toBe("not_tested");
  });
  it("PUT upserts", async () => {
    (prisma.defectiveBlocksAssessment.upsert as jest.Mock).mockResolvedValue({ id: "d1" });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ pyriteTestResult: "pass" }) });
    await PUT(req, ctx("h1"));
    expect(prisma.defectiveBlocksAssessment.upsert).toHaveBeenCalled();
  });
});
