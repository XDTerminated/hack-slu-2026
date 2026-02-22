"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type DashboardStats, getDashboardStats } from "~/server/stats";
import { loadQuizState, type SavedQuizState } from "~/utils/quiz-state";

type Range = "today" | "week" | "month";

const rangeLabels: Record<Range, string> = {
  today: "Today",
  week: "Week",
  month: "Month",
};

const rangeTitles: Record<Range, string> = {
  today: "Today's",
  week: "This Week's",
  month: "This Month's",
};

export function DashboardContent() {
  const router = useRouter();
  const [range, setRange] = useState<Range>("today");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedQuiz, setSavedQuiz] = useState<SavedQuizState | null>(null);

  useEffect(() => {
    setSavedQuiz(loadQuizState());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getDashboardStats(range).then((s) => {
      if (!cancelled) {
        setStats(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const s = stats ?? {
    studyMinutes: 0,
    quizzesCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
  };

  const accuracy =
    s.questionsAnswered > 0
      ? Math.round((s.correctAnswers / s.questionsAnswered) * 100)
      : 0;

  function resumeQuiz() {
    if (!savedQuiz) return;
    router.push(`/course/${savedQuiz.courseId}/study?resume=1`);
  }

  return (
    <>
      {/* Title row */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p
            className="text-lg text-[#DCD8FF]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            {rangeTitles[range]}
          </p>
          <h1
            className="text-5xl text-[#DCD8FF]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            Dashboard
          </h1>
        </div>

        {/* Time range pills */}
        <div className="flex gap-3">
          {(["today", "week", "month"] as Range[]).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                range === r
                  ? "bg-[#DCD8FF] text-white"
                  : "border-2 border-[#DCD8FF] text-[#DCD8FF] hover:bg-[#DCD8FF]/10"
              }`}
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bento grid */}
      <div
        className={`grid grid-cols-12 grid-rows-[200px_200px] gap-6 transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}
      >
        {/* Row 1, left — Resume Quiz or Quizzes Completed */}
        {savedQuiz ? (
          <button
            type="button"
            onClick={resumeQuiz}
            className="col-span-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl bg-[#DCD8FF] shadow-sm transition hover:bg-[#9b8ad3] hover:shadow-md"
          >
            <span
              className="text-lg text-white/70"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {savedQuiz.courseName}
            </span>
            <span
              className="mt-1 text-3xl font-bold text-white"
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              Resume Quiz
            </span>
            <span
              className="mt-2 text-sm text-white/50"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {savedQuiz.currentIndex + 1}/{savedQuiz.questions.length}{" "}
              questions
            </span>
          </button>
        ) : (
          <div className="col-span-5 flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
            <span
              className="text-7xl font-bold text-[#797979]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {s.quizzesCompleted}
            </span>
            <span
              className="mt-2 text-xl text-[#B0B0B0]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {s.quizzesCompleted === 1 ? "Quiz" : "Quizzes"} Completed
            </span>
          </div>
        )}

        {/* Row 1, middle — Study Time */}
        <div className="col-span-3 flex items-center justify-center rounded-3xl bg-white shadow-sm">
          <div className="flex gap-2">
            <span
              className="text-8xl font-bold text-[#797979]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {s.studyMinutes}
            </span>
            <div className="flex flex-col items-center justify-center pt-3">
              <Image
                width={36}
                height={36}
                src="/time.svg"
                alt="Clock"
                style={{ maxWidth: "none" }}
              />
              <span
                className="text-xl text-[#797979]"
                style={{ fontFamily: "var(--font-average-sans)" }}
              >
                mins
              </span>
            </div>
          </div>
        </div>

        {/* Row 1+2, right — Accuracy (tall card) */}
        <div className="col-span-4 row-span-2 flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
          <span
            className="text-8xl font-bold text-[#DCD8FF]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            {accuracy}%
          </span>
          <span
            className="mt-2 text-xl text-[#B0B0B0]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            Accuracy
          </span>
          <span
            className="mt-1 text-sm text-[#D0D0D0]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            {s.correctAnswers}/{s.questionsAnswered} correct
          </span>
        </div>

        {/* Row 2, left — Day Streak */}
        <div className="col-span-3 flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
          <div className="relative">
            <Image
              width={0}
              height={0}
              src="/streak.svg"
              alt="Streak"
              style={{ width: "80px", height: "auto", maxWidth: "none" }}
            />
            <span
              className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-[#FFAB44]"
              style={{
                fontFamily: "var(--font-average-sans)",
                paddingTop: "16px",
                WebkitTextStroke: "3px #FFAB44",
              }}
            >
              {s.streak}
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white"
              style={{
                fontFamily: "var(--font-average-sans)",
                paddingTop: "16px",
              }}
            >
              {s.streak}
            </span>
          </div>
          <span
            className="text-2xl font-semibold text-[#FFAB44]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            Day Streak
          </span>
        </div>

        {/* Row 2, middle — Questions Answered */}
        <div className="col-span-5 flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
          <span
            className="text-7xl font-bold text-[#797979]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            {s.questionsAnswered}
          </span>
          <span
            className="mt-2 text-xl text-[#B0B0B0]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            Questions Answered
          </span>
        </div>
      </div>
    </>
  );
}
