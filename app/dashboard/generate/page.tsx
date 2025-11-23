"use client";

import { useState } from "react";

type QType = "MCQ" | "Short Answer" | "Long Answer";

export default function GenerateQuestionsPage() {
  const [paragraph, setParagraph] = useState("");
  const [count, setCount] = useState(5);
  const [marks, setMarks] = useState(2);
  const [questions, setQuestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);

  // ----------------------------------
  // Helper functions — clean text
  // ----------------------------------

  const stopwords = new Set([
    "the","and","for","that","with","this","from","they","their","your","are","was",
    "were","have","has","but","not","you","will","can","all","been","which","when",
    "what","where","how","into","about","also","more","these","those","such","may"
  ]);

  function wordsFromText(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));
  }

  function topKeywords(text: string, max = 20) {
    const words = wordsFromText(text);
    const freq: Record<string, number> = {};

    for (const w of words) freq[w] = (freq[w] || 0) + 1;

    return Object.keys(freq)
      .sort((a, b) => freq[b] - freq[a])
      .slice(0, max);
  }

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function pickRandom(list: string[]) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // ----------------------------------
  // Templates
  // ----------------------------------

  const short2 = [
    "What is <topic>?",
    "Define <topic>.",
    "Write a short note on <topic>.",
    "State the meaning of <topic>.",
    "Explain <topic> briefly."
  ];

  const short4 = [
    "Explain <topic>.",
    "Write a brief explanation on <topic>.",
    "What are the key points of <topic>?",
    "Write a note on <topic>.",
    "State the importance of <topic>."
  ];

  const short6 = [
    "Describe <topic> in detail.",
    "Explain <topic> with suitable examples.",
    "Write a detailed note on <topic>.",
    "How does <topic> work? Explain.",
    "Discuss the concept of <topic>."
  ];

  const long10 = [
    "Explain <topic> with a neat diagram. Discuss its advantages.",
    "Discuss <topic> in detail. List its applications.",
    "Explain <topic>. What are its features and uses?",
    "Write a detailed essay on <topic> and its significance.",
    "Describe <topic> in detail. Also explain its types."
  ];

  // ----------------------------------
  // Offline Q generation
  // ----------------------------------

  function generateQuestionsOffline() {
    setMessage(null);

    if (paragraph.trim().length < 20) {
      setMessage("Paste a longer paragraph.");
      return;
    }

    const keywords = topKeywords(paragraph, 30);
    const finalQs: string[] = [];

    for (let i = 0; i < count; i++) {
      const kw = capitalize(keywords[i % keywords.length] || "topic");

      let template = "";

      if (marks <= 2) template = pickRandom(short2);
      else if (marks <= 4) template = pickRandom(short4);
      else if (marks <= 6) template = pickRandom(short6);
      else template = pickRandom(long10);

      finalQs.push(`(${marks} marks) ${template.replace("<topic>", kw)}`);
    }

    setQuestions(finalQs);
  }

  // ----------------------------------
  // AI FALLBACK
  // ----------------------------------

  async function generateSmart() {
    setMessage(null);

    if (paragraph.trim().length < 20) {
      setMessage("Paste a longer paragraph.");
      return;
    }

    try {
      const res = await fetch("/api/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paragraph, marks }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.question) {
          setQuestions([`(${marks} marks) ${data.question}`]);
          setMessage("Generated using AI ✓");
          return;
        }
      }

      generateQuestionsOffline();
      setMessage(null);

    } catch {
      generateQuestionsOffline();
      setMessage(null);
    }
  }

  // ----------------------------------
  // Save to DB
  // ----------------------------------

  async function saveQuestionsToDB() {
    if (questions.length === 0) {
      setMessage("No generated questions to save.");
      return;
    }

    setSaving(true);
    setMessage(null);

    for (const q of questions) {
      await fetch("/api/add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: q,
          subject: "General",
          subjectCode: "GEN",
          marks,
          difficulty: "Medium"
        }),
      });
    }

    setSaving(false);
    setMessage("Saved to database ✓");
  }

  async function saveSelectedToDB() {
    if (selected.length === 0) {
      setMessage("Select questions to save.");
      return;
    }
    setSaving(true);
    setMessage(null);
    for (const i of selected) {
      const q = questions[i];
      await fetch("/api/add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: q,
          subject: "General",
          marks,
          difficulty: "Medium",
          subjectCode: "GEN",
        }),
      });
    }
    setSaving(false);
    setMessage("Selected saved ✓");
  }

  function toggleSelect(i: number) {
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  function selectAll() {
    setSelected(questions.map((_, i) => i));
  }

  function clearSelection() {
    setSelected([]);
  }

  // ----------------------------------
  // UI
  // ----------------------------------

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4 text-black">Smart Question Generator</h1>
      <div className="bg-white border rounded shadow p-4 space-y-4">
        <textarea
          className="border p-2 w-full h-48"
          placeholder="Paste your paragraph..."
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">No. of Questions</label>
            <input
              className="border p-2 w-full"
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Marks</label>
            <input
              className="border p-2 w-full"
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={generateSmart} className="bg-blue-600 hover:bg-blue-700 text-black p-2 rounded">
            Generate
          </button>

          <button
            onClick={() => {
              setQuestions([]);
              setMessage(null);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-black p-2 rounded"
          >
            Clear
          </button>

          <button
            onClick={saveQuestionsToDB}
            disabled={saving || questions.length === 0}
            className={`p-2 rounded text-black ${saving || questions.length === 0 ? "bg-green-300" : "bg-green-600 hover:bg-green-700"}`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={saveSelectedToDB}
            disabled={saving || selected.length === 0}
            className={`p-2 rounded text-black ${saving || selected.length === 0 ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {saving ? "Saving..." : "Save Selected"}
          </button>
          <button onClick={selectAll} disabled={questions.length === 0} className="p-2 rounded bg-gray-200 text-black">Select All</button>
          <button onClick={clearSelection} className="p-2 rounded bg-gray-200 text-black">Clear Selection</button>
        </div>

        {message && <p className="mt-1 text-sm text-black">{message}</p>}
      </div>

      <div className="mt-6">
        <h2 className="font-bold mb-2">Generated Questions</h2>
        {questions.length === 0 ? (
          <p>No questions yet.</p>
        ) : (
          <ol className="list-decimal ml-6 space-y-2">
            {questions.map((q, i) => (
              <li key={i} className={`border p-2 rounded bg-white ${selected.includes(i) ? "ring-2 ring-blue-500" : ""}`}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.includes(i)} onChange={() => toggleSelect(i)} />
                  <span>{q}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
