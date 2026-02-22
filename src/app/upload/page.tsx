"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "~/components/nav/sidebar";
import { Spinner } from "~/components/ui/spinner";
import type { MockExam } from "~/server/ai";
import { generateExam } from "~/app/upload/actions";
import {
  clearExamState,
  loadExamState,
  saveExamState,
} from "~/utils/quiz-state";

type UploadedFile = { id: string; name: string };

export default function UploadPage() {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const examRef = useRef<HTMLDivElement>(null);

  const [exam, setExam] = useState<MockExam | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  // Load saved exam from localStorage on mount
  useEffect(() => {
    const saved = loadExamState();
    if (saved) {
      setExam(saved.exam);
    }
  }, []);

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
      setUploads((prev) => [
        ...prev,
        { id: data.id!, name: data.name ?? file.name },
      ]);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  async function handleFiles(fileList: FileList) {
    for (const file of Array.from(fileList)) {
      await uploadFile(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void handleFiles(e.target.files);
    }
    e.target.value = "";
  }

  function removeFile(id: string) {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }

  async function startExam() {
    if (uploads.length === 0) return;
    setGenerating(true);
    setExamError(null);
    const result = await generateExam(uploads.map((u) => u.id));
    if (result.error || !result.exam) {
      setExamError(result.error ?? "Failed to generate exam.");
      setGenerating(false);
      return;
    }
    setExam(result.exam);
    const examName = uploads.map((u) => u.name.replace(/\.[^.]+$/, "")).join(", ");
    saveExamState({ exam: result.exam, name: examName, createdAt: Date.now() });
    setGenerating(false);
  }

  function downloadPDF() {
    window.print();
  }

  function resetAll() {
    setExam(null);
    setShowAnswerKey(false);
    setUploads([]);
    setExamError(null);
    clearExamState();
  }

  // ── Generating state ──
  if (generating) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar />
        <main className="pt-8 pr-10 pb-16 pl-28">
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <Spinner className="scale-200" />
            <p
              className="animate-pulse text-lg text-[#B0B0B0]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Generating your mock final exam...
            </p>
            <p
              className="text-sm text-gray-400"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              This may take 15-30 seconds
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Exam view ──
  if (exam) {
    let questionNum = 0;

    return (
      <>
        {/* Print styles */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
            .exam-doc {
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .exam-doc * { color: black !important; }
            @page { margin: 0.75in; }
          }
          .print-only { display: none; }
        `}</style>

        <div className="no-print min-h-screen bg-[#FAFAFA]">
          <Sidebar />
          <main className="pt-8 pr-10 pb-16 pl-28">
            {/* Action bar */}
            <div className="mb-6 flex items-center justify-between">
              <h1
                className="text-4xl font-bold text-[#7E6FAE]"
                style={{ fontFamily: "var(--font-average-sans)" }}
              >
                Mock Final Exam
              </h1>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className="cursor-pointer rounded-full border-2 border-[#7E6FAE] px-6 py-2 text-sm font-medium text-[#7E6FAE] transition hover:bg-[#7E6FAE]/10"
                  style={{ fontFamily: "var(--font-josefin-sans)" }}
                >
                  {showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
                </button>
                <button
                  type="button"
                  onClick={downloadPDF}
                  className="cursor-pointer rounded-full bg-[#7E6FAE] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#6B5D9A]"
                  style={{ fontFamily: "var(--font-josefin-sans)" }}
                >
                  Download as PDF
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="cursor-pointer rounded-full border-2 border-gray-300 px-6 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
                  style={{ fontFamily: "var(--font-josefin-sans)" }}
                >
                  New Exam
                </button>
              </div>
            </div>

            {/* Exam document */}
            <div
              ref={examRef}
              className="exam-doc mx-auto max-w-3xl rounded-2xl bg-white p-12 shadow-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <ExamDocument
                exam={exam}
                showAnswerKey={showAnswerKey}
                questionNumStart={questionNum}
              />
            </div>
          </main>
        </div>

        {/* Print-only version */}
        <div className="print-only">
          <div
            className="exam-doc"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <ExamDocument
              exam={exam}
              showAnswerKey={showAnswerKey}
              questionNumStart={0}
            />
          </div>
        </div>
      </>
    );
  }

  // ── Upload state ──
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="pt-8 pr-10 pb-16 pl-28">
        <h1
          className="mb-8 text-5xl font-bold text-[#7E6FAE]"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          Create a Mock Final Exam
        </h1>

        <div className="mx-auto max-w-2xl">
          {/* Dotted upload box */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: Interactive drag and drop */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Interactive drag and drop */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-8 py-16 transition ${
              dragOver
                ? "border-[#7E6FAE] bg-[#F3F0FF]"
                : "border-gray-300 hover:border-[#7E6FAE]/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.html,.htm,.json,.rtf"
              multiple
              onChange={handleFileInput}
            />
            {uploading ? (
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7E6FAE] border-t-transparent" />
                <span
                  className="text-lg text-gray-500"
                  style={{ fontFamily: "var(--font-average-sans)" }}
                >
                  Uploading...
                </span>
              </div>
            ) : (
              <>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7E6FAE"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-4"
                >
                  <title>Upload Icon</title>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span
                  className="text-lg text-gray-500"
                  style={{ fontFamily: "var(--font-average-sans)" }}
                >
                  Drag files here, or click to upload
                </span>
                <span
                  className="mt-1 text-sm text-gray-400"
                  style={{ fontFamily: "var(--font-average-sans)" }}
                >
                  PDF, DOCX, PPTX, TXT, and more
                </span>
              </>
            )}
          </div>

          {uploadError && (
            <p className="mt-3 text-center text-sm text-red-500">
              {uploadError}
            </p>
          )}

          {examError && (
            <p className="mt-3 text-center text-sm text-red-500">{examError}</p>
          )}

          {/* Uploaded files list */}
          {uploads.length > 0 && (
            <div className="mt-6 space-y-2">
              {uploads.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3"
                >
                  <span
                    className="truncate font-medium text-gray-700"
                    style={{ fontFamily: "var(--font-average-sans)" }}
                  >
                    {u.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(u.id);
                    }}
                    className="ml-3 cursor-pointer text-gray-400 transition hover:text-red-500"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <title>Remove</title>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generate exam button */}
          {uploads.length > 0 && (
            <button
              type="button"
              onClick={() => void startExam()}
              className="mt-8 w-full cursor-pointer rounded-full bg-[#7E6FAE] py-3.5 text-lg font-semibold text-white shadow-lg transition hover:bg-[#6B5D9A] hover:shadow-xl active:bg-[#5B4D8A]"
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              Generate Mock Final Exam
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Exam Document Component ──

function ExamDocument({
  exam,
  showAnswerKey,
}: {
  exam: MockExam;
  showAnswerKey: boolean;
  questionNumStart: number;
}) {
  let questionNum = 0;

  return (
    <>
      {/* Header */}
      <div className="mb-8 border-b-2 border-black pb-6 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          {exam.title}
        </h1>
        <div className="mt-4 flex justify-between text-sm">
          <span>Name: ________________________________</span>
          <span>Date: ________________</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>Section: _____________</span>
          <span>Total Points: {exam.totalPoints}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8 rounded border border-gray-300 bg-gray-50 p-4 text-sm italic">
        <strong className="not-italic">Instructions:</strong>{" "}
        {exam.instructions}
      </div>

      {/* Sections */}
      {exam.sections.map((section) => (
        <div key={section.name} className="mb-10">
          <h2 className="mb-4 border-b border-gray-400 pb-1 text-lg font-bold">
            {section.name}
          </h2>

          <div className="space-y-6">
            {section.questions.map((q) => {
              questionNum++;
              return (
                <div key={questionNum}>
                  <div className="flex gap-2">
                    <span className="font-bold">{questionNum}.</span>
                    <div className="flex-1">
                      <span>
                        {q.question}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({q.points} pt{q.points !== 1 ? "s" : ""})
                      </span>

                      {/* Multiple choice options */}
                      {q.type === "multiple-choice" && q.options && (
                        <div className="mt-2 space-y-1 pl-2">
                          {q.options.map((opt) => (
                            <div key={opt} className="flex items-start gap-2">
                              <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-gray-400" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True/False */}
                      {q.type === "true-false" && (
                        <div className="mt-2 flex gap-6 pl-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-3.5 w-3.5 rounded-full border border-gray-400" />
                            <span>True</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-3.5 w-3.5 rounded-full border border-gray-400" />
                            <span>False</span>
                          </div>
                        </div>
                      )}

                      {/* Short answer lines */}
                      {q.type === "short-answer" && (
                        <div className="mt-4 space-y-5 pl-2">
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                        </div>
                      )}

                      {/* Essay space */}
                      {q.type === "essay" && (
                        <div className="mt-4 space-y-5 pl-2">
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                          <div className="border-b border-gray-300" />
                        </div>
                      )}

                      {/* Answer key */}
                      {showAnswerKey && (
                        <div className="no-print mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                          <strong>Answer:</strong> {q.answer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* End of exam */}
      <div className="mt-12 border-t-2 border-black pt-4 text-center text-sm font-bold">
        — END OF EXAM —
      </div>
    </>
  );
}
