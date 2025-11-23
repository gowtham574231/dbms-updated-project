import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function mergeText(a: string, b: string) {
  const aTrim = a.trim().replace(/\s+/g, " ");
  const bTrim = b.trim().replace(/\s+/g, " ");
  const endsQ = /\?$/.test(aTrim) || /\?$/.test(bTrim);
  const connector = " and ";
  let merged = aTrim.replace(/[\.?]*$/, "") + connector + bTrim.replace(/^[A-Z]/, (s) => s.toLowerCase());
  merged = merged.trim() + (endsQ ? "?" : ".");
  return merged;
}

function mergeDifficulty(d1: string, d2: string) {
  if (d1 === "Hard" || d2 === "Hard") return "Hard";
  if (d1 === "Medium" && d2 === "Medium") return "Medium";
  if (d1 === "Easy" && d2 === "Easy") return "Easy";
  return "Medium";
}

export async function POST(req: Request) {
  try {
    const { id1, id2 } = await req.json();
    const q1 = Number(id1);
    const q2 = Number(id2);
    if (!q1 || !q2 || isNaN(q1) || isNaN(q2)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    try {
      const procRes: any = await prisma.$queryRawUnsafe("CALL combine_questions(?, ?)", q1, q2);
      const first = Array.isArray(procRes) ? procRes[0] : null;
      const newId = first && first[0] && first[0].combined_question_id ? Number(first[0].combined_question_id) : null;
      if (newId) {
        const combined = await prisma.question.findUnique({ where: { id: newId } });
        return NextResponse.json({ success: true, combined });
      }
    } catch {}

    const items = await prisma.question.findMany({ where: { id: { in: [q1, q2] } } });
    if (items.length !== 2) {
      return NextResponse.json({ error: "Questions not found" }, { status: 404 });
    }
    const a = items.find((x) => x.id === q1)!;
    const b = items.find((x) => x.id === q2)!;
    const combinedText = mergeText(a.text, b.text);
    const totalMarks = Number(a.marks) + Number(b.marks);
    const diff = mergeDifficulty(a.difficulty, b.difficulty);
    const subjectName = a.subject || b.subject || "General";
    let subj: any = null;
    if (a.subjectId) subj = await prisma.subject.findUnique({ where: { id: a.subjectId } });
    if (!subj && a.subjectCode) subj = await prisma.subject.findUnique({ where: { code: a.subjectCode } });
    if (!subj) subj = await prisma.subject.findFirst({ where: { name: subjectName } });
    if (!subj) {
      const base = (a.subjectCode || subjectName || "GEN").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) || "GEN";
      try {
        subj = await prisma.subject.create({ data: { name: subjectName, code: base } });
      } catch {
        const code2 = `${base}${Math.floor(Math.random() * 1000)}`;
        subj = await prisma.subject.create({ data: { name: subjectName, code: code2 } });
      }
    }
    const created = await prisma.question.create({
      data: {
        text: combinedText,
        subject: subjectName,
        subjectCode: subj.code,
        marks: totalMarks,
        difficulty: diff,
        subjectId: subj.id,
      },
    });
    try {
      await prisma.combinedQuestions.create({
        data: {
          question1Id: a.id,
          question2Id: b.id,
          combinedText,
          marks: totalMarks,
          difficulty: diff,
          subjectId: a.subjectId || null,
        },
      });
    } catch {}
    return NextResponse.json({ success: true, combined: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}