import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type Ctx = { params: Promise<{ filename: string }> };

const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", pdf: "application/pdf",
  mp4: "video/mp4",
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { filename } = await ctx.params;
  // Prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.join(process.cwd(), "data", "media", safe);

  try {
    const buffer = await readFile(filePath);
    const ext = safe.split(".").pop()?.toLowerCase() || "jpg";
    const contentType = MIME[ext] || "application/octet-stream";
    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000" },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
