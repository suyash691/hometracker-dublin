/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/apartment/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
describe("Apartment API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns details", async () => {
    (prisma.apartmentDetails.findUnique as jest.Mock).mockResolvedValue({ id: "a1", managementCompany: "OMC Ltd" });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect((await res.json()).managementCompany).toBe("OMC Ltd");
  });
  it("PUT upserts with OMC checklist on create", async () => {
    (prisma.apartmentDetails.upsert as jest.Mock).mockImplementation((a: Record<string, unknown>) => Promise.resolve(a.create));
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ managementCompany: "Test OMC" }) });
    await PUT(req, ctx("h1"));
    expect(prisma.apartmentDetails.upsert).toHaveBeenCalled();
    const call = (prisma.apartmentDetails.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.omcChecklist).toBeDefined();
    expect(JSON.parse(call.create.omcChecklist)).toHaveLength(14);
  });
});
