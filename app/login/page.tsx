"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // for inline errors

  async function login() {
    // Clear previous error
    setErrorMsg("");

    // Frontend validation
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "/dashboard";
    } else {
      // Show backend error (e.g., user not found)
      setErrorMsg(data.error || "Something went wrong.");
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-sm transform transition-all duration-300 hover:scale-[1.02]">
        <h1 className="text-3xl font-extrabold text-center text-black mb-6 tracking-wide">
          Welcome Back
        </h1>

        <div className="flex flex-col gap-4">

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <p className="text-red-600 text-center font-medium -mt-2">
              {errorMsg}
            </p>
          )}

          <input
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
          />

          <button
            onClick={login}
            disabled={!email || !password}
            className={`w-full py-3 rounded-xl font-semibold shadow-md transition 
              ${
                email && password
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-700 mt-4">
            Don’t have an account?
            <a href="/signup" className="text-purple-700 font-semibold hover:underline">
              {" "}Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
