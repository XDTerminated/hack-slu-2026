"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { CanvasFile } from "~/server/canvas";
import { loadQuizState } from "~/utils/quiz-state";

type Props = {
  courseId: number;
  courseCode: string;
  files: CanvasFile[];
  externalLinks: { url: string; title: string }[];
  assignments: { id: number; name: string }[];
  hasSyllabus: boolean;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(contentType: string): string {
  if (contentType === "application/pdf") return "PDF";
  if (
    contentType.includes("presentation") ||
    contentType.includes("powerpoint")
  )
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

type UploadedFile = { id: string; name: string };

export function ContentPicker({
  courseId,
  courseCode,
  files,
  externalLinks,
  assignments,
  hasSyllabus,
}: Props) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());

  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(
    new Set(),
  );
  const [syllabusSelected, setSyllabusSelected] = useState(false);
  const [search, setSearch] = useState("");
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [selectedUploads, setSelectedUploads] = useState<Set<string>>(
    new Set(),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // 0=easy, 1=medium, 2=hard
  const difficultyLabels = ["Easy", "Medium", "Hard"] as const;

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

  function toggleAssignment(id: number) {
    setSelectedAssignments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleUpload(id: string) {
    setSelectedUploads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as {
        id?: string;
        name?: string;
        error?: string;
      };
      if (!res.ok || !data.id) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      const uploaded = { id: data.id, name: data.name ?? file.name };
      setUploads((prev) => [...prev, uploaded]);
      setSelectedUploads((prev) => new Set(prev).add(uploaded.id));
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    e.target.value = "";
  }

  const totalSelected =
    selectedFiles.size +
    selectedLinks.size +
    selectedAssignments.size +
    (syllabusSelected ? 1 : 0) +
    selectedUploads.size;

  function startStudying() {
    if (totalSelected === 0) return;
    const params = new URLSearchParams();
    if (selectedFiles.size > 0) {
      params.set("files", Array.from(selectedFiles).join(","));
    }
    if (selectedLinks.size > 0) {
      params.set("links", Array.from(selectedLinks).join(","));
    }
    if (selectedAssignments.size > 0) {
      params.set("assignments", Array.from(selectedAssignments).join(","));
    }
    if (syllabusSelected) {
      params.set("syllabus", "1");
    }
    if (selectedUploads.size > 0) {
      params.set("uploads", Array.from(selectedUploads).join(","));
    }
    params.set("difficulty", String(difficulty));
    router.push(`/course/${courseId}/study?${params.toString()}`);
  }

  const lowerSearch = search.toLowerCase();
  const filteredFiles = search
    ? files.filter((f) => f.display_name.toLowerCase().includes(lowerSearch))
    : files;
  const filteredLinks = search
    ? externalLinks.filter((l) => l.title.toLowerCase().includes(lowerSearch))
    : externalLinks;
  const filteredAssignments = search
    ? assignments.filter((a) => a.name.toLowerCase().includes(lowerSearch))
    : assignments;
  const showSyllabus =
    hasSyllabus && (!search || "syllabus".includes(lowerSearch));
  const hasContent =
    files.length > 0 ||
    externalLinks.length > 0 ||
    assignments.length > 0 ||
    hasSyllabus;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      {/* Course header + search */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          className="text-2xl font-bold text-[#7E6FAE]"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          {courseCode}
        </h2>
        <div className="relative">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Logo</title>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-full border border-gray-200 py-2 pr-4 pl-9 text-sm text-gray-600 placeholder-gray-400 focus:border-[#7E6FAE] focus:ring-1 focus:ring-[#7E6FAE] focus:outline-none"
          />
        </div>
      </div>

      {/* Lessons (Canvas files + external links) */}
      {(filteredFiles.length > 0 || filteredLinks.length > 0) && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Lessons</h2>
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <label
                key={`file-${file.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-[#7E6FAE]"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleFile(file.id)}
                  className="h-5 w-5 rounded border-gray-300 text-[#7E6FAE]"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900">
                    {file.display_name}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {fileTypeLabel(file["content-type"])}
                  </span>
                  <span className="ml-1 text-xs text-gray-300">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </label>
            ))}
            {filteredLinks.map((link) => (
              <label
                key={`link-${link.url}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-[#7E6FAE]"
              >
                <input
                  type="checkbox"
                  checked={selectedLinks.has(link.url)}
                  onChange={() => toggleLink(link.url)}
                  className="h-5 w-5 rounded border-gray-300 text-[#7E6FAE]"
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

      {/* Assignments */}
      {filteredAssignments.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Assignments
          </h2>
          <div className="space-y-2">
            {filteredAssignments.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-[#7E6FAE]"
              >
                <input
                  type="checkbox"
                  checked={selectedAssignments.has(a.id)}
                  onChange={() => toggleAssignment(a.id)}
                  className="h-5 w-5 rounded border-gray-300 text-[#7E6FAE]"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900">{a.name}</span>
                  <span className="ml-2 text-xs text-gray-400">Assignment</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Syllabus */}
      {showSyllabus && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Syllabus</h2>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-[#7E6FAE]">
            <input
              type="checkbox"
              checked={syllabusSelected}
              onChange={() => setSyllabusSelected((v) => !v)}
              className="h-5 w-5 rounded border-gray-300 text-[#7E6FAE]"
            />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-gray-900">Course Syllabus</span>
              <span className="ml-2 text-xs text-gray-400">Syllabus</span>
            </div>
          </label>
        </div>
      )}

      {!hasContent && (
        <p className="py-8 text-center text-gray-400">
          No readable files or pages found for this course.
        </p>
      )}

      {hasContent &&
        filteredFiles.length === 0 &&
        filteredLinks.length === 0 &&
        filteredAssignments.length === 0 &&
        !showSyllabus &&
        search && (
          <p className="py-8 text-center text-gray-400">
            No results for &ldquo;{search}&rdquo;
          </p>
        )}

      {/* Uploaded files */}
      {uploads.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Uploaded Files
          </h2>
          <div className="space-y-2">
            {uploads.map((u) => (
              <label
                key={u.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-[#7E6FAE]"
              >
                <input
                  type="checkbox"
                  checked={selectedUploads.has(u.id)}
                  onChange={() => toggleUpload(u.id)}
                  className="h-5 w-5 rounded border-gray-300 text-[#7E6FAE]"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900">{u.name}</span>
                  <span className="ml-2 text-xs text-gray-400">Uploaded</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* File upload area */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: Interactive drag and drop */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: Interactive drag and drop */}
      <span
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-4 text-gray-400 transition ${
          dragOver
            ? "border-[#7E6FAE] bg-[#F3F0FF]"
            : "border-gray-200 hover:border-[#7E6FAE]/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.html,.htm,.json,.rtf"
          onChange={handleFileInput}
        />
        {uploading ? (
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7E6FAE] border-t-transparent" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7E6FAE"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>File Upload Icon</title>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-sm">
              Drag a file here, or click to upload
            </span>
          </>
        )}
      </span>

      {uploadError && (
        <p className="mt-2 text-sm text-red-500">{uploadError}</p>
      )}

      {/* Spacer so fixed button doesn't overlap content */}
      {totalSelected > 0 && <div className="h-32" />}

      {/* Difficulty + Start studying — fixed at bottom */}
      {totalSelected > 0 && (
        <div className="fixed right-0 bottom-0 left-0 z-50 bg-linear-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent px-10 pt-4 pb-6 pl-28">
          <div className="mx-auto max-w-2xl">
            {/* Difficulty selector */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <span
                className="text-sm font-medium text-gray-500"
                style={{ fontFamily: "var(--font-josefin-sans)" }}
              >
                Difficulty
              </span>
              <div className="flex rounded-full border border-gray-200 bg-white p-1">
                {difficultyLabels.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDifficulty(i)}
                    className={`cursor-pointer rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      difficulty === i
                        ? "bg-[#7E6FAE] text-white shadow-sm"
                        : "text-gray-500 hover:text-[#7E6FAE]"
                    }`}
                    style={{ fontFamily: "var(--font-josefin-sans)" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (loadQuizState()) {
                  setShowConfirm(true);
                } else {
                  startStudying();
                }
              }}
              className="block w-full cursor-pointer rounded-full bg-[#7E6FAE] py-3.5 text-lg font-semibold text-white shadow-lg transition hover:bg-[#6B5D9A] hover:shadow-xl active:bg-[#5B4D8A]"
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              Start Studying ({totalSelected} item
              {totalSelected !== 1 ? "s" : ""})
            </button>
          </div>
        </div>
      )}

      {/* Confirmation popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h2
              className="mb-3 text-xl font-bold text-gray-800"
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              Are you sure?
            </h2>
            <p
              className="mb-6 text-gray-500"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Are you sure you want to make a new quiz? It&apos;s going to
              overwrite the old quiz.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 cursor-pointer rounded-full border-2 border-gray-300 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
                style={{ fontFamily: "var(--font-josefin-sans)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  startStudying();
                }}
                className="flex-1 cursor-pointer rounded-full bg-[#7E6FAE] py-2.5 text-sm font-medium text-white transition hover:bg-[#6B5D9A]"
                style={{ fontFamily: "var(--font-josefin-sans)" }}
              >
                Yes, overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
