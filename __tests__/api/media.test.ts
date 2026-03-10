/**
 * @jest-environment node
 */
import { GET } from "@/app/api/media/[filename]/route";
import { NextRequest } from "next/server";

const ctx = (filename: string) => ({ params: Promise.resolve({ filename }) });

// Mock fs.readFile
jest.mock("fs/promises", () => ({
  readFile: jest.fn().mockRejectedValue(new Error("File not found")),
}));

describe("Media file serving", () => {
  it("returns 404 for missing file", async () => {
    const res = await GET(new NextRequest("http://localhost/api/media/nonexistent.jpg"), ctx("nonexistent.jpg"));
    expect(res.status).toBe(404);
  });

  it("strips path traversal from filename", async () => {
    const { readFile } = require("fs/promises");
    const res = await GET(new NextRequest("http://localhost/api/media/..%2F..%2Fetc%2Fpasswd"), ctx("../../etc/passwd"));
    // path.basename("../../etc/passwd") = "passwd" — it should NOT read /etc/passwd
    expect(readFile).toHaveBeenCalledWith(expect.not.stringContaining("/etc/"));
  });

  it("strips directory traversal with dots", async () => {
    const { readFile } = require("fs/promises");
    await GET(new NextRequest("http://localhost"), ctx("../../../etc/shadow"));
    expect(readFile).toHaveBeenCalledWith(expect.stringContaining("shadow"));
    expect(readFile).not.toHaveBeenCalledWith(expect.stringContaining("../"));
  });
});
