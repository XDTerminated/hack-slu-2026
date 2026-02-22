"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActivityChart } from "~/components/dashboard/activity-chart";
import { Spinner } from "~/components/ui/spinner";
import {
  type DashboardStats,
  getCourseNames,
  getDashboardStats,
} from "~/server/stats";
import {
  loadExamState,
  loadQuizState,
  type SavedExamState,
  type SavedQuizState,
} from "~/utils/quiz-state";

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
  const [courseNames, setCourseNames] = useState<Record<number, string>>({});
  const [savedQuiz, setSavedQuiz] = useState<SavedQuizState | null>(null);
  const [savedExam, setSavedExam] = useState<SavedExamState | null>(null);

  useEffect(() => {
    setSavedQuiz(loadQuizState());
    setSavedExam(loadExamState());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardStats(range)
      .then(async (s) => {
        if (cancelled) return;
        setStats(s);
        if (s.perCourse.length > 0) {
          const names = await getCourseNames(
            s.perCourse.map((c) => c.courseId),
          );
          if (!cancelled) setCourseNames(names);
        }
        if (!cancelled) setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  if (loading && !stats) {
    return (
      <div className="flex min-h-112.5 flex-col items-center justify-center gap-4">
        <Spinner className="scale-200" />
        <p
          className="animate-pulse text-lg text-[#B0B0B0]"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  const s = stats ?? {
    studyMinutes: 0,
    quizzesCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    perCourse: [],
    dailyActivity: [],
  };

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
            className="text-lg text-[#7E6FAE]"
            style={{
              fontFamily: "var(--font-average-sans)",
            }}
          >
            {rangeTitles[range]}
          </p>
          <h1
            className="text-5xl font-bold text-[#7E6FAE]"
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
                  ? "bg-[#7E6FAE] text-white"
                  : "cursor-pointer border-2 border-[#7E6FAE] text-[#7E6FAE] hover:bg-[#7E6FAE]/10"
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
        {/* Row 1, left — Resume Quiz / Resume Exam / Quizzes Completed */}
        {savedQuiz ? (
          <button
            type="button"
            onClick={resumeQuiz}
            className="col-span-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl bg-[#7E6FAE] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-[#6B5D9A] hover:shadow-xl"
          >
            <span
              className="text-lg text-white/70 transition-colors duration-300"
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
              className="mt-2 text-sm text-white/50 transition-colors duration-300"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {savedQuiz.currentIndex + 1}/{savedQuiz.questions.length}{" "}
              questions
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                  (savedQuiz.difficulty ?? "medium") === "easy"
                    ? "bg-green-400/20 text-green-200"
                    : (savedQuiz.difficulty ?? "medium") === "hard"
                      ? "bg-red-400/20 text-red-200"
                      : "bg-white/15 text-white/70"
                }`}
              >
                {savedQuiz.difficulty ?? "medium"}
              </span>
            </span>
          </button>
        ) : savedExam ? (
          <button
            type="button"
            onClick={() => router.push("/upload")}
            className="col-span-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl bg-[#7E6FAE] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-[#6B5D9A] hover:shadow-xl"
          >
            <span
              className="text-lg text-white/70 transition-colors duration-300"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {savedExam.name}
            </span>
            <span
              className="mt-1 text-3xl font-bold text-white"
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              Resume Mock Exam
            </span>
            <span
              className="mt-2 text-sm text-white/50 transition-colors duration-300"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {savedExam.exam.totalPoints} points
            </span>
          </button>
        ) : (
          <div className="group col-span-5 flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
            <span
              className="text-7xl font-bold text-[#797979] transition-colors duration-300 group-hover:text-[#7E6FAE]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {s.quizzesCompleted}
            </span>
            <span
              className="mt-2 text-xl text-[#B0B0B0] transition-colors duration-300 group-hover:text-[#7E6FAE]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              {s.quizzesCompleted === 1 ? "Quiz" : "Quizzes"} Completed
            </span>
          </div>
        )}

        {/* Row 1, middle — Study Time */}
        <div className="group col-span-3 flex items-center justify-center rounded-3xl bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
          <div className="flex gap-2">
            <span
              className="text-8xl font-bold text-[#797979] transition-colors duration-300 group-hover:text-[#7E6FAE]"
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
                className="transition-transform duration-300 group-hover:rotate-12"
                style={{ maxWidth: "none" }}
              />
              <span
                className="text-xl text-[#797979] transition-colors duration-300 group-hover:text-[#7E6FAE]"
                style={{ fontFamily: "var(--font-average-sans)" }}
              >
                mins
              </span>
            </div>
          </div>
        </div>

        {/* Row 1+2, right — Per-Course Accuracy (tall card) */}
        <div className="group col-span-4 row-span-2 flex flex-col rounded-3xl bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
          <span
            className="pt-5 text-center text-xl text-[#B0B0B0]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            Accuracy
          </span>
          {s.perCourse.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <span
                className="text-8xl font-bold text-[#7E6FAE]"
                style={{ fontFamily: "var(--font-average-sans)" }}
              >
                0%
              </span>
              <span
                className="mt-1 text-sm text-[#D0D0D0]"
                style={{ fontFamily: "var(--font-average-sans)" }}
              >
                No quizzes yet
              </span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-5">
              <div className="space-y-3">
                {s.perCourse.map((c) => {
                  const pct =
                    c.questionsAnswered > 0
                      ? Math.round(
                          (c.correctAnswers / c.questionsAnswered) * 100,
                        )
                      : 0;
                  return (
                    <div key={c.courseId} className="group/row rounded-xl px-2 py-1 transition-colors duration-200 hover:bg-[#F8F6FF]">
                      <div className="flex items-baseline justify-between">
                        <span
                          className="truncate text-sm text-[#797979] transition-colors duration-200 group-hover/row:text-[#5B4D8A]"
                          style={{ fontFamily: "var(--font-average-sans)" }}
                        >
                          {courseNames[c.courseId] ?? `Course ${c.courseId}`}
                        </span>
                        <span
                          className="ml-2 shrink-0 text-2xl font-bold text-[#7E6FAE]"
                          style={{ fontFamily: "var(--font-average-sans)" }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-[#F0EEF8]">
                        <div
                          className="h-2 rounded-full bg-[#7E6FAE] transition-shadow duration-200 group-hover/row:shadow-[0_0_8px_rgba(126,111,174,0.4)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className="text-xs text-[#D0D0D0] transition-colors duration-200 group-hover/row:text-[#7E6FAE]"
                        style={{ fontFamily: "var(--font-average-sans)" }}
                      >
                        {c.correctAnswers}/{c.questionsAnswered} correct
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Row 2, left — Day Streak */}
        <div className="group col-span-3 flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
          <div className="relative transition-transform duration-300 group-hover:scale-110">
            <Image
              width={0}
              height={0}
              src="/streak.svg"
              alt="Streak"
              className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,171,68,0.5)]"
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

        {/* Row 2, middle — Activity Chart */}
        <div className="col-span-5 rounded-3xl bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
          <ActivityChart dailyActivity={s.dailyActivity} />
        </div>
      </div>
    </>
  );
}
