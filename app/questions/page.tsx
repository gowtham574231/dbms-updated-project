"use client";

import { useState, useEffect } from "react";

export default function QuestionsPage() {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState(1);
  const [difficulty, setDifficulty] = useState("Easy");

  // protect page
  useEffect(() => {
    if (localStorage.getItem("loggedIn") !== "true") {
      window.location.href = "/login";
    }
  }, []);

  async function addQuestion() {
    const res = await fetch("/api/add-question", {
      method: "POST",
      body: JSON.stringify({
        text,
        subject,
        marks,
        difficulty,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Question Added!");
      setText("");
      setSubject("");
      setMarks(1);
      setDifficulty("Easy");
    } else {
      alert(data.error);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Question</h1>

      <div className="max-w-md space-y-4">

        <textarea
          className="border p-2 w-full"
          placeholder="Enter question text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Marks"
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
        />

        <select
          className="border p-2 w-full"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          Add Question
        </button>
      </div>
    </div>
  );
}
