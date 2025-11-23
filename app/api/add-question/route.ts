import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, subject, subjectCode, marks, difficulty, tags } = body;

    if (!text || !subject || !marks || !difficulty) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const codeBase = (subjectCode || subject || "GEN").toString().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) || "GEN";
    let subj = await prisma.subject.findUnique({ where: { code: codeBase } });
    if (!subj) {
      try {
        subj = await prisma.subject.create({ data: { name: subject, code: codeBase } });
      } catch {
        const alt = `${codeBase}${Math.floor(Math.random() * 1000)}`;
        subj = await prisma.subject.create({ data: { name: subject, code: alt } });
      }
    }

    await prisma.question.create({
      data: {
        text,
        subject,
        subjectCode: subj.code,
        marks: Number(marks),
        difficulty,
        tags: tags ? tags : undefined,
        subjectId: subj.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
