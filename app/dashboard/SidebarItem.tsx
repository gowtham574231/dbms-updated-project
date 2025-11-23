"use client";

import { usePathname } from "next/navigation";

export default function SidebarItem({
  label,
  href,
  danger = false,
}: {
  label: string;
  href: string;
  danger?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const base = isActive
    ? "bg-blue-600 text-white"
    : danger
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-900";

  return (
    <li>
      <a
        href={href}
        className={`block px-4 py-3 rounded-lg font-semibold transition ${base} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </a>
    </li>
  );
}
