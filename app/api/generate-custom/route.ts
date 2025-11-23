import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { paragraph, count = 3, qtype = "Short Answer", marks = 2 } = await req.json();

    if (!paragraph || paragraph.length < 20) {
      return NextResponse.json(
        { error: "Please enter a valid paragraph." },
        { status: 400 }
      );
    }

    const prompt = `Generate ${count} ${qtype} questions from this paragraph. Each question should be worth ${marks} marks. Return as a numbered list with each question on a new line. Paragraph: ${paragraph}`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const aiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      })
    });
    const data = await aiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const questions = text.split(/\n+/).map((l: string) => l.replace(/^\d+\.?\s*/, "")).filter((l: string) => l.length > 0).slice(0, Number(count)).map((q: string) => `(${marks} marks) ${q}`);

    if (questions.length === 0) {
      return NextResponse.json({ error: "No output from Gemini" }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate questions." },
      { status: 500 }
    );
  }
}
