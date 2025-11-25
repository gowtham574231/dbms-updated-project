import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, subject, subjectCode, marks, difficulty, tags } = body;

    // 1️⃣ Validate
    if (!text || !subject || !marks || !difficulty) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Normalize subject code
    const codeBase =
      (subjectCode || subject || "GEN")
        .toString()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10) || "GEN";

    // 3️⃣ Find or create subject
    let subj = await prisma.subject.findUnique({ where: { code: codeBase } });
    if (!subj) {
      try {
        subj = await prisma.subject.create({
          data: { name: subject, code: codeBase },
        });
      } catch {
        const alt = `${codeBase}${Math.floor(Math.random() * 1000)}`;
        subj = await prisma.subject.create({
          data: { name: subject, code: alt },
        });
      }
    }

    // 4️⃣ Check if question exists (same text & subject)
    const existing = await prisma.question.findFirst({
      where: { text, subjectCode: subj.code },
    });

    // 5️⃣ If exists → update marks (and difficulty if needed)
    if (existing) {
      const updated = await prisma.question.update({
        where: { id: existing.id },
        data: {
          marks: Number(marks),
          difficulty,
          tags: tags ?? existing.tags,
        },
      });

      return NextResponse.json({
        success: true,
        updated: true,
        message: "Existing question updated with new marks.",
        question: updated,
      });
    }

    // 6️⃣ Else create new question
    const newQuestion = await prisma.question.create({
      data: {
        text,
        subject: subj.name,
        subjectCode: subj.code,
        marks: Number(marks),
        difficulty,
        tags: tags ?? undefined,
        subjectId: subj.id,
      },
    });

    return NextResponse.json({
      success: true,
      created: true,
      question: newQuestion,
      message: "New question added successfully.",
    });
  } catch (error: any) {
    console.error("❌ Add Question Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
  