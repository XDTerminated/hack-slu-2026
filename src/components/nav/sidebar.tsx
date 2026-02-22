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
  href: "/dashboard",
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
      <div className="flex h-full flex-col items-center justify-between rounded-full bg-[#DCD8FF] px-3 py-6 shadow-lg">
        <div className="flex flex-col items-center gap-4 pt-4">
          {/* Cognify brand mark + half cog */}
          <span
            className="text-[12px] font-bold tracking-wider text-[#7E6FAE]"
            style={{
              fontFamily: "var(--font-josefin-sans)",
              letterSpacing: "0.08em",
            }}
          >
            cognify
          </span>
          <div className="-mt-4 mb-6">
            <div className="overflow-hidden" style={{ height: 22 }}>
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#7E6FAE]"
                style={{ marginTop: -22 }}
              >
                <title>Cognify</title>
                <line x1="2" y1="11" x2="9" y2="11" strokeWidth="4" />
                <line x1="15" y1="11" x2="22" y2="11" strokeWidth="4" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>

          {navItems.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.label}
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
        </div>

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
