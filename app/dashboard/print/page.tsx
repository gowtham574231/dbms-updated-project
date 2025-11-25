"use client";

import { useEffect, useMemo, useState } from "react";


export default function PrintPage() {
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [totalMarks, setTotalMarks] = useState(30);
  const [timeDate, setTimeDate] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  const [selected, setSelected] = useState<number[]>([]);
  const [logo, setLogo] = useState<string | null>("/LOGO.png");

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
    return questions.filter(
      (q: any) => subjectFilter === "All" || q.subject === subjectFilter
    );
  }, [questions, subjectFilter]);

  const printing = useMemo(() => {
    return selected.length > 0
      ? questions.filter((q: any) => selected.includes(q.id))
      : [];
  }, [questions, selected]);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <>
      {/* PRINT CSS */}
      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-a4, .print-a4 * {
            visibility: visible !important;
          }

          .print-a4 {
            position: absolute !important;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }

          nav, aside, header, footer, .sidebar, .logout-btn, .no-print {
            display: none !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          ol {
            padding-left: 18px;
          }
        }

        /* Screen preview */
        .print-preview {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
          background: white;
          box-shadow: none !important;
          border: none !important;
        }
      `}</style>

      {/* UI Controls */}
      <div className="p-6 no-print">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <input
            className="border p-2"
            placeholder="Enter Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Enter Subject Code"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Enter Total Marks"
            value={totalMarks}
            onChange={(e) => setTotalMarks(Number(e.target.value))}
          />
          <input
            className="border p-2"
            placeholder="Enter Time & Date"
            value={timeDate}
            onChange={(e) => setTimeDate(e.target.value)}
          />
          
          <button
            className={`p-2 rounded ${
              printing.length === 0 ? "bg-blue-300" : "bg-blue-600 text-white"
            }`}
            disabled={printing.length === 0}
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Subject Filter</label>
            <select
              className="border p-2 w-full"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              className="bg-gray-200 p-2 rounded"
              onClick={() => setSelected(filtered.map((q: any) => q.id))}
            >
              Select All Filtered
            </button>
            <button
              className="bg-gray-200 p-2 rounded"
              onClick={() => setSelected([])}
            >
              Clear Selection
            </button>
          </div>
        </div>

        <div className="bg-white border rounded mb-6">
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
                <tr key={q.id}>
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(q.id)}
                      onChange={() => toggle(q.id)}
                    />
                  </td>
                  <td className="p-2 border text-center font-medium">{q.id}</td>
                  <td className="p-2 border">{q.text}</td>
                  <td className="p-2 border text-center font-medium">{q.subject}</td>
                  <td className="p-2 border text-center font-medium">{q.marks}</td>
                  <td className="p-2 border text-center font-semibold">
                    {String(q.difficulty).charAt(0).toUpperCase() +
                      String(q.difficulty).slice(1).toLowerCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
              
      {/* PRINT TEMPLATE */}
      <div className="print-preview print-a4">
        {/* Header */}
        <div className="flex justify-center items-center mb-4 text-black">
          {logo && (
            <img
              src="/LOGO.jpg"
              alt="College Logo"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
                marginRight: "15px",
              }}
            />
          )}
          <div className="text-center leading-tight">
            <div className="text-3xl font-extrabold tracking-wide">SAHYADRI</div>
            <div className="text-[15px] font-medium">
              College of Engineering & Management
            </div>
            <div className="text-[14px] italic font-normal">(An Autonomous College)</div>
            <div className="text-[14px] font-medium">Mangaluru</div>
          </div>
        </div>

        <div className="flex justify-between mb-1 text-black">
          <div className="font-semibold">Subject : {subjectName}</div>
          <div className="font-semibold">Subject Code: {subjectCode}</div>
        </div>

        <div className="flex justify-between mb-6 text-sm text-black">
          <div>{timeDate}</div>
          <div>Total Marks: {totalMarks}</div>
        </div>

        {printing.length === 0 ? (
          <p className="text-center text-sm">
            Select questions from the table above to print.
          </p>
        ) : (
          <ol className="list-decimal ml-6 space-y-4 text-black text-[15px] leading-relaxed">
            {printing.map((q: any) => (
              <li key={q.id}>
                {q.text} <span className="font-semibold">({q.marks} Marks)</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
