"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CanvasFile, PageSummary } from "~/server/canvas";
import { Button } from "~/components/ui/button";

type Props = {
  courseId: number;
  courseCode: string;
  files: CanvasFile[];
  externalLinks: { url: string; title: string }[];
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(contentType: string): string {
  if (contentType === "application/pdf") return "PDF";
  if (contentType.includes("presentation") || contentType.includes("powerpoint"))
    return "PPTX";
  if (contentType.includes("wordprocessing") || contentType.includes("msword"))
    return "DOCX";
  if (contentType.includes("spreadsheet") || contentType.includes("excel"))
    return "XLSX";
  if (contentType.includes("html")) return "HTML";
  if (contentType.startsWith("text/plain")) return "TXT";
  if (contentType.startsWith("text/")) return "Text";
  return "File";
}

function linkTypeLabel(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return "PPTX";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "DOCX";
  if (lower.includes("docs.google.com/document")) return "Google Doc";
  if (lower.includes("docs.google.com/presentation")) return "Slides";
  if (lower.includes("drive.google.com")) return "Drive";
  return "Link";
}

export function ContentPicker({ courseId, files, externalLinks }: Props) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  function toggleFile(fileId: number) {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }

  function toggleLink(url: string) {
    setSelectedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function selectAll() {
    setSelectedFiles(new Set(files.map((f) => f.id)));
    setSelectedLinks(new Set(externalLinks.map((l) => l.url)));
  }

  function deselectAll() {
    setSelectedFiles(new Set());
    setSelectedLinks(new Set());
  }

  const totalSelected = selectedFiles.size + selectedLinks.size;

  function startStudying() {
    if (totalSelected === 0) return;
    const params = new URLSearchParams();
    if (selectedFiles.size > 0) {
      params.set("files", Array.from(selectedFiles).join(","));
    }
    if (selectedLinks.size > 0) {
      params.set("links", Array.from(selectedLinks).join(","));
    }
    router.push(`/course/${courseId}/study?${params.toString()}`);
  }

  const hasContent = files.length > 0 || externalLinks.length > 0;

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

      {externalLinks.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Linked Files
          </h2>
          <div className="space-y-2">
            {externalLinks.map((link) => (
              <label
                key={link.url}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300"
              >
                <input
                  type="checkbox"
                  checked={selectedLinks.has(link.url)}
                  onChange={() => toggleLink(link.url)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900">
                    {link.title}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {linkTypeLabel(link.url)}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

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
