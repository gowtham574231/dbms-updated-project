"use client";

import { useState, useEffect } from "react";

export default function AddQuestion() {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [marks, setMarks] = useState(1);
  const [difficulty, setDifficulty] = useState("Easy");
  const [tags, setTags] = useState<string>("");

  useEffect(() => {
    if (localStorage.getItem("loggedIn") !== "true") {
      window.location.href = "/login";
    }
  }, []);

  async function addQuestion() {
    try {
      const res = await fetch("/api/add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          subject,
          subjectCode,
          marks,
          difficulty,
          tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Question Added!");
        setText("");
        setSubject("");
        setSubjectCode("");
        setMarks(1);
        setDifficulty("Easy");
        setTags("");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Server Error");
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-black">Add Question</h1>
      <div className="bg-white border rounded shadow p-4 space-y-4">
        <div>
          <label className="block text-sm mb-1">Question Text</label>
          <textarea
            className="border p-2 w-full h-28"
            placeholder="Enter the question"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Subject</label>
            <input
              className="border p-2 w-full"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Subject Code</label>
            <input
              className="border p-2 w-full"
              placeholder="Code"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Marks</label>
            <input
              type="number"
              className="border p-2 w-full"
              placeholder="Marks"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Difficulty</label>
            <select
              className="border p-2 w-full"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Tags</label>
          <input
            className="border p-2 w-full"
            placeholder="comma separated"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <button
          onClick={addQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-black p-2 rounded w-full"
        >
          Add Question
        </button>
      </div>
    </div>
  );
}
