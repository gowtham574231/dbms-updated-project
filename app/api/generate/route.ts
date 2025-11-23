import { NextResponse } from "next/server";
export const runtime = "nodejs";

function wordsFromText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
}

function topKeywords(text: string, max = 20) {
  const words = wordsFromText(text);
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, max);
}

function pickRandom(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

function offlineGenerate(paragraph: string, count: number, marks: number) {
  const short2 = ["What is <topic>?","Define <topic>.","Write a short note on <topic>.","State the meaning of <topic>.","Explain <topic> briefly."];
  const short4 = ["Explain <topic>.","Write a brief explanation on <topic>.","What are the key points of <topic>?","Write a note on <topic>.","State the importance of <topic>."];
  const short6 = ["Describe <topic> in detail.","Explain <topic> with suitable examples.","Write a detailed note on <topic>.","How does <topic> work? Explain.","Discuss the concept of <topic>."];
  const long10 = ["Explain <topic> with a neat diagram. Discuss its advantages.","Discuss <topic> in detail. List its applications.","Explain <topic>. What are its features and uses?","Write a detailed essay on <topic> and its significance.","Describe <topic> in detail. Also explain its types."];
  const kw = topKeywords(paragraph, 30);
  const res: string[] = [];
  for (let i = 0; i < count; i++) {
    const topic = kw[i % kw.length] || "topic";
    let template = "";
    if (marks <= 2) template = pickRandom(short2);
    else if (marks <= 4) template = pickRandom(short4);
    else if (marks <= 6) template = pickRandom(short6);
    else template = pickRandom(long10);
    res.push(`(${marks} marks) ${template.replace("<topic>", topic.charAt(0).toUpperCase() + topic.slice(1))}`);
  }
  return res;
}

async function tryGemini(paragraph: string, count: number, marks: number) {
  const prompt = `Generate ${count} exam-style questions from this paragraph. Each question is worth ${marks} marks. Return as a numbered list with each question on a new line. Paragraph: ${paragraph}`;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const aiRes = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }) });
  const data = await aiRes.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  if (!text) return null;
  return text.split(/\n+/).map((l: string) => l.replace(/^\d+\.?\s*/, "")).filter((l: string) => l.length > 0).slice(0, count).map((q: string) => `(${marks} marks) ${q}`);
}

export async function POST(req: Request) {
  try {
    const { paragraph, count = 3, marks = 2 } = await req.json();
    if (!paragraph || paragraph.trim().length < 20) {
      return NextResponse.json({ error: "Enter a valid paragraph" }, { status: 400 });
    }
    const c = Math.min(Math.max(Number(count), 3), 6);
    const m = Number(marks);
    const g = await tryGemini(paragraph, c, m);
    if (g && g.length > 0) return NextResponse.json({ questions: g, source: "gemini" });
    const f = offlineGenerate(paragraph, c, m);
    return NextResponse.json({ questions: f, source: "offline" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}