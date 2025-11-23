"use client";
import { ReactNode } from "react";
import SidebarItem from "./SidebarItem"; // ⭐ IMPORTANT

export default function DashboardLayout({ children }: { children: ReactNode }) {
  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("loggedIn");
      window.location.href = "/login";
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r shadow-sm p-5">
        <h2 className="text-lg font-bold mb-6 text-center text-black">📘 Dashboard</h2>
        <ul className="space-y-2">
          <SidebarItem label="Dashboard" href="/dashboard" />
          <SidebarItem label="Add Question" href="/dashboard/add-question" />
          <SidebarItem label="View Questions" href="/dashboard/view-questions" />
          <SidebarItem label="Generate Questions" href="/dashboard/generate" />
          <SidebarItem label="Combine Questions" href="/dashboard/combine" />
          <SidebarItem label="Print Question Paper" href="/dashboard/print" />
        </ul>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-5 py-3 flex justify-between items-center">
          <div className="font-semibold text-black">QPMS</div>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-black px-3 py-2 rounded">Logout</button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
