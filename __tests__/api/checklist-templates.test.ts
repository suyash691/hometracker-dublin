/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/checklist-templates/route";
import { NextRequest } from "next/server";

beforeEach(() => jest.clearAllMocks());

describe("GET /api/checklist-templates", () => {
  it("returns templates ordered by isDefault desc", async () => {
    const templates = [
      { id: "t1", name: "Default", items: '["Roof","Plumbing"]', isDefault: true },
      { id: "t2", name: "Custom", items: '["Garden"]', isDefault: false },
    ];
    (prisma.checklistTemplate.findMany as jest.Mock).mockResolvedValue(templates);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(2);
  });
});

describe("POST /api/checklist-templates", () => {
  it("creates a template and serializes items array", async () => {
    (prisma.checklistTemplate.create as jest.Mock).mockResolvedValue({ id: "t1" });
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "My Template", items: ["Roof", "Plumbing"], isDefault: false }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const call = (prisma.checklistTemplate.create as jest.Mock).mock.calls[0][0];
    expect(call.data.items).toBe(JSON.stringify(["Roof", "Plumbing"]));
  });
});
