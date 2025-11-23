"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function signup() {
    setErrorMsg("");
    if (!email || !password || password.length < 6 || password !== confirm) {
      setErrorMsg("Check email and password (min 6 chars) and confirm match.");
      return;
    }
    const res = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (data.success) {
      window.location.href = "/login";
    } else {
      setErrorMsg(data.error || "Signup failed");
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Create Account</h1>
        {errorMsg && <p className="text-red-600 text-center font-medium mb-2">{errorMsg}</p>}
        <input className="w-full p-3 rounded-xl border border-gray-300 mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-3 rounded-xl border border-gray-300 mb-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="w-full p-3 rounded-xl border border-gray-300 mb-3" type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button onClick={signup} className="w-full py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white">Sign up</button>
        <p className="text-center text-sm text-gray-700 mt-4">Already have an account? <a href="/login" className="text-purple-700 font-semibold">Login</a></p>
      </div>
    </div>
  );
}