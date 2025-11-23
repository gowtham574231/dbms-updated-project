"use client";

import { useEffect, useMemo, useState } from "react";

export default function ViewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        all: showAll ? "1" : "0",
      });
      setLoading(true);
      const res = await fetch(`/api/get-questions?${qs.toString()}`);
      const data = await res.json();

      if (data.success) {
        setQuestions(data.questions);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      } else {
        alert("Error loading questions");
      }
      setLoading(false);
    }

    load();
  }, [page, pageSize, showAll]);

  const subjects = useMemo(() => {
    const s = new Set((questions as any).map((q: any) => q.subject));
    return ["All", ...Array.from(s).filter(Boolean)];
  }, [questions]);

  const filtered = useMemo(() => {
    return (questions as any).filter((q: any) => {
      const sOk = subjectFilter === "All" || q.subject === subjectFilter;
      const qOk = !search || q.text.toLowerCase().includes(search.toLowerCase());
      return sOk && qOk;
    });
  }, [questions, subjectFilter, search]);

  async function deleteQuestion(id: number) {
    const sure = confirm("Are you sure you want to delete this question?");
    if (!sure) return;
    setDeleting((prev) => [...prev, id]);
    try {
      const res = await fetch(`/api/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q: any) => q.id !== id));
      } else {
        alert(data.error || "Failed to delete question");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeleting((prev) => prev.filter((x) => x !== id));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">📘 All Questions</h1>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <input
          className="border p-2 flex-1"
          placeholder="Search question text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <label className="text-sm">Page size</label>
          <select className="border p-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={showAll} onChange={(e) => { setShowAll(e.target.checked); setPage(1); }} />
            Show all
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="ml-3">Loading…</span>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <table className="w-full">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 border text-black">ID</th>
              <th className="p-3 border text-black">Question</th>
              <th className="p-3 border text-black">Subject</th>
              <th className="p-3 border text-black">Marks</th>
              <th className="p-3 border">Difficulty</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((q: any, index) => (
              <tr
                key={q.id}
                className={`border transition-all ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50`}
              >
                <td className="p-3 border text-center text-black font-medium">{q.id}</td>
                <td className="p-3 border text-black">{q.text}</td>
                <td className="p-3 border text-center text-black font-medium">{q.subject}</td>
                <td className="p-3 border text-center text-black font-medium">{q.marks}</td>
                <td
                  className={`p-3 border text-center font-semibold ${
                    q.difficulty === "Easy"
                      ? "text-green-600"
                      : q.difficulty === "Medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {String(q.difficulty).charAt(0).toUpperCase() + String(q.difficulty).slice(1).toLowerCase()}
                </td>

                {/* DELETE ICON BUTTON */}
                <td className="p-3 border text-center">
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className={`p-2 rounded ${deleting.includes(q.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100"}`}
                    disabled={deleting.includes(q.id)}
                    title="Delete"
                  >
                    {deleting.includes(q.id) ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="red"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7h12m-9 4v6m6-6v6M9 7V4h6v3m-9 0h12l-1.5 12.3A2 2 0 0114.5 21h-5a2 2 0 01-1.99-1.7L6 7z"
                        />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center p-6 text-gray-500">
            No questions found...
          </p>
        )}
        </div>
      )}

      {!showAll && (
        <div className="mt-4 flex items-center justify-between">
          <div>Page {page} of {totalPages} • Total {total}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <button className="px-3 py-1 border rounded" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
