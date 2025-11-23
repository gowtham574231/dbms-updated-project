"use client";

import { useEffect, useState, useMemo } from "react";

export default function Dashboard() {
  // protect dashboard
  useEffect(() => {
    if (localStorage.getItem("loggedIn") !== "true") {
      window.location.href = "/login";
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/get-questions?all=1");
        const data = await res.json();
        if (data.success) setQuestions(data.questions || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const total = questions.length;
    const subj = new Set<string>();
    let latest: string | null = null;
    let hard = 0, medium = 0, easy = 0;
    for (const q of questions) {
      if (q.subject) subj.add(q.subject);
      if (!latest || new Date(q.createdAt) > new Date(latest)) latest = q.createdAt;
      const d = String(q.difficulty);
      if (d === "Hard") hard++;
      else if (d === "Medium") medium++;
      else if (d === "Easy") easy++;
    }
    return { total, subjects: subj.size, latest, hard, medium, easy };
  }, [questions]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-black">Welcome back</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 p-6">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>Loading stats…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border rounded shadow p-4">
            <div className="text-sm">Total Questions</div>
            <div className="text-3xl font-bold text-black">{stats.total}</div>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <div className="text-sm">Subjects</div>
            <div className="text-3xl font-bold text-black">{stats.subjects}</div>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <div className="text-sm">Latest Added</div>
            <div className="text-black">{stats.latest ? new Date(stats.latest).toLocaleString() : "—"}</div>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <div className="text-sm">Easy</div>
            <div className="text-2xl font-bold text-black">{stats.easy}</div>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <div className="text-sm">Medium</div>
            <div className="text-2xl font-bold text-black">{stats.medium}</div>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <div className="text-sm">Hard</div>
            <div className="text-2xl font-bold text-black">{stats.hard}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/dashboard/add-question" className="bg-blue-600 text-black rounded shadow p-4 text-center font-semibold">Add Question</a>
        <a href="/dashboard/view-questions" className="bg-green-600 text-black rounded shadow p-4 text-center font-semibold">View Questions</a>
        <a href="/dashboard/generate" className="bg-indigo-600 text-black rounded shadow p-4 text-center font-semibold">Generate Questions</a>
        <a href="/dashboard/combine" className="bg-teal-600 text-black rounded shadow p-4 text-center font-semibold">Combine Questions</a>
        <a href="/dashboard/print" className="bg-orange-600 text-black rounded shadow p-4 text-center font-semibold">Print Paper</a>
      </div>
    </div>
  );
}
