/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/new-build-compliance/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
describe("New Build Compliance API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns compliance data", async () => {
    (prisma.newBuildCompliance.findUnique as jest.Mock).mockResolvedValue({ id: "n1", warrantyProvider: "homebond" });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect((await res.json()).warrantyProvider).toBe("homebond");
  });
  it("PUT upserts", async () => {
    (prisma.newBuildCompliance.upsert as jest.Mock).mockResolvedValue({ id: "n1" });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ warrantyProvider: "blp" }) });
    await PUT(req, ctx("h1"));
    expect(prisma.newBuildCompliance.upsert).toHaveBeenCalled();
  });
});
