"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CanvasFile, PageSummary } from "~/server/canvas";

type Props = {
  courseId: number;
  courseCode: string;
  files: CanvasFile[];
  pages: PageSummary[];
};

export function ContentPicker({ courseId, courseCode, files, pages }: Props) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  function toggleFile(fileId: number) {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }

  function togglePage(pageUrl: string) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageUrl)) next.delete(pageUrl);
      else next.add(pageUrl);
      return next;
    });
  }

  const totalSelected = selectedFiles.size + selectedPages.size;

  function startStudying() {
    if (totalSelected === 0) return;
    const params = new URLSearchParams();
    if (selectedFiles.size > 0) {
      params.set("files", Array.from(selectedFiles).join(","));
    }
    if (selectedPages.size > 0) {
      params.set("pages", Array.from(selectedPages).join(","));
    }
    router.push(`/course/${courseId}/study?${params.toString()}`);
  }

  const topics = [
    ...files.map((f) => ({
      type: "file" as const,
      id: f.id,
      url: "",
      label: f.display_name,
    })),
    ...pages.map((p) => ({
      type: "page" as const,
      id: 0,
      url: p.url,
      label: p.title,
    })),
  ];

  const filtered = topics.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase())
  );

  const hasContent = topics.length > 0;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      {/* Course header + search */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          className="text-2xl font-bold text-[#DCD8FF]"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          {courseCode}
        </h2>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-full border border-gray-200 py-2 pl-9 pr-4 text-sm text-gray-600 placeholder-gray-400 focus:border-[#DCD8FF] focus:outline-none focus:ring-1 focus:ring-[#DCD8FF]"
          />
        </div>
      </div>

      {/* Topic list */}
      <div className="space-y-3">
        {filtered.map((topic) => {
          const isSelected =
            topic.type === "file"
              ? selectedFiles.has(topic.id)
              : selectedPages.has(topic.url);

          return (
            <button
              key={topic.type === "file" ? topic.id : topic.url}
              onClick={() =>
                topic.type === "file"
                  ? toggleFile(topic.id)
                  : togglePage(topic.url)
              }
              style={{ fontFamily: "var(--font-josefin-sans)" }}
              className={`w-full rounded-2xl border px-6 py-4 text-left text-base font-medium transition ${
                isSelected
                  ? "border-[#DCD8FF] bg-[#DCD8FF]/40 text-gray-800"
                  : "border-gray-100 bg-white text-gray-700 shadow-sm hover:border-[#DCD8FF]/50 hover:shadow-md"
              }`}
            >
              {topic.label}
            </button>
          );
        })}
      </div>

      {!hasContent && (
        <p className="py-8 text-center text-gray-400">
          No readable files or pages found for this course.
        </p>
      )}

      {filtered.length === 0 && hasContent && (
        <p className="py-8 text-center text-gray-400">
          No results for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* File upload area */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 px-6 py-4 text-gray-400 transition hover:border-[#DCD8FF]/50">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#DCD8FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="text-sm">
          Drag a file here, or choose a file to upload
        </span>
      </div>

      {/* Start studying button */}
      {totalSelected > 0 && (
        <button
          onClick={startStudying}
          className="mt-6 w-full rounded-full bg-[#DCD8FF] py-3.5 text-lg font-semibold text-white shadow-md transition hover:shadow-lg"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          Start Studying ({totalSelected} item{totalSelected !== 1 ? "s" : ""})
        </button>
      )}
    </div>
  );
}
