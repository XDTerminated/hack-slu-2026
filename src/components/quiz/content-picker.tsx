"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import type { CanvasFile } from "~/server/canvas";

type Props = {
  courseId: number;
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
    <div>
      <div className="mb-4 flex gap-3">
        <Button variant="ghost" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="ghost" onClick={deselectAll}>
          Deselect All
        </Button>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Files</h2>
          <div className="space-y-2">
            {files.map((file) => (
              <label
                key={file.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleFile(file.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900">
                    {file.display_name}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {fileTypeLabel(file["content-type"])} &middot;{" "}
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

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
        <p className="py-8 text-center text-gray-500">
          No readable files or pages found for this course.
        </p>
      )}

      <Button
        onClick={startStudying}
        disabled={totalSelected === 0}
        className="mt-2 w-full py-3 text-lg"
      >
        Start Studying ({totalSelected} item{totalSelected !== 1 ? "s" : ""}{" "}
        selected)
      </Button>
    </div>
  );
}
