"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    match: (p: string) => p === "/dashboard",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <title>Dashboard Icon</title>
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
      </svg>
    ),
  },
  {
    href: "/courses",
    label: "Courses",
    match: (p: string) => p.startsWith("/courses") || p.startsWith("/course/"),
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <title>Courses Icon</title>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8M8 10h8M8 14h4" />
        <polyline points="9 18 10.5 20 15 16" />
      </svg>
    ),
  },
  {
    href: "/upload",
    label: "Upload",
    match: (p: string) => p.startsWith("/upload"),
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <title>Analytics Icon</title>
        <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
  },
];

const settingsItem = {
  href: "/settings",
  label: "Settings",
  icon: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Settings Icon</title>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-4 left-4 z-50">
      <div className="flex h-full flex-col items-start justify-between overflow-visible rounded-full bg-[#DCD8FF] px-3 py-6 shadow-lg">
        <div className="flex flex-col items-start gap-4 pt-4">
          {navItems.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center rounded-full p-3 transition-all duration-200 ease-out hover:bg-[#7E6FAE] hover:text-[#DCD8FF] ${
                  isActive ? "bg-white/40 text-[#5B4D8A]" : "text-[#7E6FAE]"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span
                  className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-white opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-32 group-hover:pr-1 group-hover:opacity-100"
                  style={{ fontFamily: "var(--font-josefin-sans)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href={settingsItem.href}
          className="group flex items-center rounded-full p-3 text-[#7E6FAE] transition-all duration-200 ease-out hover:bg-[#7E6FAE] hover:text-[#DCD8FF]"
        >
          <span className="shrink-0">{settingsItem.icon}</span>
          <span
            className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-white opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-32 group-hover:pr-1 group-hover:opacity-100"
            style={{ fontFamily: "var(--font-josefin-sans)" }}
          >
            {settingsItem.label}
          </span>
        </Link>
      </div>
    </aside>
  );
}
