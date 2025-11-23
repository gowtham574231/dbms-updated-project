"use client";

import { useEffect, useMemo, useState } from "react";

export default function CombinePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/get-questions");
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    }
    load();
  }, []);

  const subjects = useMemo(() => {
    const s = new Set<string>();
    questions.forEach((q: any) => s.add(q.subject));
    return ["All", ...Array.from(s).filter(Boolean)];
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter((q: any) => {
      const sOk = subjectFilter === "All" || q.subject === subjectFilter;
      const dOk = difficultyFilter === "All" || q.difficulty === difficultyFilter;
      return sOk && dOk;
    });
  }, [questions, subjectFilter, difficultyFilter]);

  function toggle(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const next = [...prev, id];
      if (next.length > 2) return next.slice(next.length - 2);
      return next;
    });
  }

  const preview = useMemo(() => {
    if (selected.length !== 2) return null;
    const a = questions.find((x: any) => x.id === selected[0]);
    const b = questions.find((x: any) => x.id === selected[1]);
    if (!a || !b) return null;
    const total = Number(a.marks) + Number(b.marks);
    const diff = a.difficulty === "Hard" || b.difficulty === "Hard" ? "Hard" : (a.difficulty === "Medium" && b.difficulty === "Medium" ? "Medium" : (a.difficulty === "Easy" && b.difficulty === "Easy" ? "Easy" : "Medium"));
    return { total, diff };
  }, [selected, questions]);

  async function combine() {
    if (selected.length !== 2) return;
    const res = await fetch("/api/combine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id1: selected[0], id2: selected[1] }) });
    const data = await res.json();
    if (data.success) {
      setResult(data.combined);
    } else {
      alert(data.error || "Combine failed");
    }
  }

  async function saveCombined() {
    if (!result) return;
    setSaving(true);
    await fetch("/api/add-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: result.text,
        subject: result.subject || "General",
        subjectCode: result.subjectCode || "GEN",
        marks: result.marks,
        difficulty: result.difficulty || "Medium",
      }),
    });
    setSaving(false);
    alert("Combined question saved");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Combine Questions</h1>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm mb-1">Subject</label>
          <select className="border p-2 w-full" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Difficulty</label>
          <select className="border p-2 w-full" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border rounded">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 border">Select</th>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Question</th>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Marks</th>
              <th className="p-2 border">Difficulty</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {filtered.map((q: any) => (
              <tr key={q.id} className="hover:bg-blue-50">
                <td className="p-2 border text-center">
                  <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggle(q.id)} />
                </td>
                <td className="p-2 border text-center font-medium text-black">{q.id}</td>
                <td className="p-2 border text-black">{q.text}</td>
                <td className="p-2 border text-center font-medium text-black">{q.subject}</td>
                <td className="p-2 border text-center font-medium text-black">{q.marks}</td>
                <td className="p-2 border text-center font-semibold text-black">{String(q.difficulty).charAt(0).toUpperCase() + String(q.difficulty).slice(1).toLowerCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={combine} disabled={selected.length !== 2} className={`p-2 rounded ${selected.length === 2 ? "bg-blue-600 text-black" : "bg-gray-300 text-black"}`}>Combine Selected</button>
        <button onClick={saveCombined} disabled={!result || saving} className={`p-2 rounded ${!result || saving ? "bg-green-300 text-black" : "bg-green-600 text-black"}`}>{saving ? "Saving..." : "Save Combined"}</button>
        {preview && (
          <div className="text-sm">Preview → Marks: {preview.total} | Difficulty: {preview.diff}</div>
        )}
      </div>

      {result && (
        <div className="mt-6 border rounded p-4 bg-white">
          <h2 className="font-bold mb-2">Combined Result</h2>
          <p>{result.text}</p>
          <div className="mt-2 text-sm">Marks: {result.marks} | Difficulty: {result.difficulty}</div>
        </div>
      )}
    </div>
  );
}