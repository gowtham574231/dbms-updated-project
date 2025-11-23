import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { paragraph, marks } = await req.json();
    if (!paragraph || marks === undefined || marks === null) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ question: null, error: "Gemini API key missing" });
    }
    const m = Number(marks);
    const prompt = `Generate ONE exam-style question from this paragraph. Marks: ${m}. Rules: - 1–2 marks: short direct question - 3–5 marks: descriptive - 6–10 marks: multi-part single-line question using full stops. Return ONLY the question. Paragraph: ${paragraph}`;
    const genAI = new GoogleGenerativeAI({ apiKey });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const config = { maxOutputTokens: 256, temperature: 0.3 } as any;
    try {
      const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: config });
      let output = result?.response?.text()?.trim() || null;
      if (!output) {
        const alt = `Write a single exam question worth ${m} marks based on this text. Return only the question. Text: ${paragraph}`;
        const result2 = await model.generateContent({ contents: [{ role: "user", parts: [{ text: alt }] }], generationConfig: config });
        output = result2?.response?.text()?.trim() || null;
      }
      if (!output) {
        return NextResponse.json({ question: null, error: "No output from Gemini" });
      }
      return NextResponse.json({ question: output });
    } catch (e: any) {
      return NextResponse.json({ question: null, error: e?.message || "Gemini error" });
    }
  } catch (err: any) {
    return NextResponse.json({ question: null, error: err.message || "Server error" });
  }
}
