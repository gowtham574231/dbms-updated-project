import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    let idNum: number | null = null;
    const pathId = context?.params?.id;
    if (typeof pathId === "string" && pathId.trim().length > 0) {
      const parsed = parseInt(pathId, 10);
      if (!Number.isNaN(parsed)) idNum = parsed;
    }
    if (!idNum) {
      try {
        const url = new URL(request.url);
        const queryId = url.searchParams.get("id");
        if (queryId) {
          const parsed = parseInt(queryId, 10);
          if (!Number.isNaN(parsed)) idNum = parsed;
        }
        if (!idNum) {
          const seg = url.pathname.split("/").filter(Boolean).pop();
          if (seg) {
            const parsedSeg = parseInt(seg, 10);
            if (!Number.isNaN(parsedSeg)) idNum = parsedSeg;
          }
        }
      } catch {}
    }
    if (!idNum) {
      try {
        const body = await request.text();
        if (body) {
          const maybe = JSON.parse(body);
          const parsed = parseInt(String(maybe?.id), 10);
          if (!Number.isNaN(parsed)) idNum = parsed;
        }
      } catch {}
    }

    const id = idNum ?? NaN;
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    await prisma.question.delete({ where: { id } });
    try {
      await prisma.deletedQuestionsLog.create({
        data: { questionId: id, text: existing.text }
      });
    } catch {}
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}