/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { PUT } from "@/app/api/houses/[id]/conveyancing/milestones/[milestoneId]/route";
import { NextRequest } from "next/server";
const ctx = (id: string, milestoneId: string) => ({ params: Promise.resolve({ id, milestoneId }) });
describe("Milestone Update API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("updates milestone status", async () => {
    (prisma.conveyancingMilestone.update as jest.Mock).mockResolvedValue({ id: "m1", status: "completed" });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ status: "completed" }) });
    await PUT(req, ctx("h1", "m1"));
    expect(prisma.conveyancingMilestone.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "completed" }) }));
  });
  it("auto-sets completedDate when completing", async () => {
    (prisma.conveyancingMilestone.update as jest.Mock).mockResolvedValue({ id: "m1" });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ status: "completed" }) });
    await PUT(req, ctx("h1", "m1"));
    const call = (prisma.conveyancingMilestone.update as jest.Mock).mock.calls[0][0];
    expect(call.data.completedDate).toBeDefined();
  });
});
