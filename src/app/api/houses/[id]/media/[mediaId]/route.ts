import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";

type Ctx = { params: Promise<{ id: string; mediaId: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { mediaId } = await ctx.params;
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete file from disk
  try { await unlink(media.filePath); } catch { /* file may not exist */ }

  await prisma.media.delete({ where: { id: mediaId } });
  return NextResponse.json({ ok: true });
}
