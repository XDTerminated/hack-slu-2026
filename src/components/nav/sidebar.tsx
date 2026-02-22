"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    match: (p: string) => p === "/dashboard",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
      </svg>
    ),
  },
  {
    href: "/courses",
    label: "Courses",
    match: (p: string) => p.startsWith("/courses") || p.startsWith("/course/"),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8M8 10h8M8 14h4" />
        <polyline points="9 18 10.5 20 15 16" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Quizzes",
    match: (p: string) => p.startsWith("/quizzes"),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 9a3 3 0 115 2c0 1.5-2 2-2 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Analytics",
    match: (p: string) => p.startsWith("/analytics"),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
  },
];

const settingsItem = {
  href: "/dashboard",
  label: "Settings",
  icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-4 top-30 z-50">
      <div className="flex flex-col items-center gap-4 rounded-full bg-[#DCD8FF] px-3 py-6 shadow-lg">
        {navItems.map((item, i) => {
          const isActive = item.match(pathname);
          return (
            <Link
              key={i}
              href={item.href}
              title={item.label}
              className={`rounded-full p-3 transition ${
                isActive
                  ? "bg-white/40 text-[#5B4D8A]"
                  : "text-[#7E6FAE] hover:bg-white/30 hover:text-[#5B4D8A]"
              }`}
            >
              {item.icon}
            </Link>
          );
        })}

        {/* Spacer */}
        <div className="my-6" />

        <Link
          href={settingsItem.href}
          title={settingsItem.label}
          className="rounded-full p-3 text-[#7E6FAE] transition hover:bg-white/30 hover:text-[#5B4D8A]"
        >
          {settingsItem.icon}
        </Link>
      </div>
    </aside>
  );
}
