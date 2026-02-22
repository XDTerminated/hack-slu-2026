"use client";

import { useEffect, useRef, useState } from "react";
import { generateQuestions } from "~/app/course/[courseId]/study/actions";
import { Spinner } from "~/components/ui/spinner";
import type { StudyQuestion } from "~/server/ai";
import { recordStudySession } from "~/server/stats";
import {
  clearQuizState,
  type SavedQuizState,
  saveQuizState,
} from "~/utils/quiz-state";

type Props = {
  courseId: number;
  courseName: string;
  studyUrl: string;
  fileIds: number[];
  pageUrls: string[];
  linkUrls: string[];
  assignmentIds: number[];
  includeSyllabus: boolean;
  uploadIds: string[];
  resumeState?: SavedQuizState;
};

export function StudySession({
  courseId,
  courseName,
  studyUrl,
  fileIds,
  pageUrls,
  linkUrls,
  assignmentIds,
  includeSyllabus,
  uploadIds,
  resumeState,
}: Props) {
  const [questions, setQuestions] = useState<StudyQuestion[]>(
    resumeState?.questions ?? [],
  );
  const [currentIndex, setCurrentIndex] = useState(
    resumeState?.currentIndex ?? 0,
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(resumeState?.score ?? 0);
  const [loading, setLoading] = useState(!resumeState);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(resumeState?.startTime ?? Date.now());
  const savedRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Should always update
  useEffect(() => {
    if (resumeState) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await generateQuestions(
        courseId,
        fileIds,
        pageUrls,
        linkUrls,
        assignmentIds,
        includeSyllabus,
        uploadIds,
      );
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
      } else {
        setQuestions(result.questions);
        startTimeRef.current = Date.now();
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist quiz state to localStorage on every change
  useEffect(() => {
    if (questions.length === 0 || finished) return;
    saveQuizState({
      courseId,
      courseName,
      questions,
      currentIndex,
      score,
      startTime: startTimeRef.current,
      studyUrl,
    });
  }, [
    courseId,
    courseName,
    studyUrl,
    questions,
    currentIndex,
    score,
    finished,
  ]);

  // Save session to DB and clear localStorage when quiz finishes
  useEffect(() => {
    if (finished && !savedRef.current && questions.length > 0) {
      savedRef.current = true;
      clearQuizState();
      const durationSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000,
      );
      recordStudySession(courseId, score, questions.length, durationSeconds)
        .then((result) => {
          if (!result.ok) {
            console.error("Failed to save study session:", result.error);
            setSaveError(result.error ?? "Unknown error");
          }
        })
        .catch((err) => {
          console.error("Server action error:", err);
          setSaveError(String(err));
        });
    }
  }, [finished, courseId, score, questions.length]);

  function handleAnswer(index: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === questions[currentIndex]?.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner />
        <p
          className="mt-4 text-gray-600"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          Analyzing course content and generating questions...
        </p>
        <p
          className="mt-1 text-sm text-gray-400"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          This may take 10-20 seconds
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div>
    );
  }

  if (finished) {
    const percentage = questions.length > 0 ? score / questions.length : 0;

    return (
      <div className="py-12 text-center">
        <h2
          className="text-3xl font-bold text-[#7E6FAE]"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          Study Complete!
        </h2>
        <p
          className="mt-6 text-7xl font-bold text-[#7E6FAE]"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          {score}/{questions.length}
        </p>
        <p
          className="mt-4 text-xl text-gray-500"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          {percentage === 1
            ? "Perfect score!"
            : percentage >= 0.7
              ? "Great job!"
              : "Keep studying!"}
        </p>
        {saveError && (
          <p className="mt-4 text-sm text-red-500">
            Failed to save session: {saveError}
          </p>
        )}
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="relative">
      {/* Question counter — fixed top right of page */}
      <span
        className="fixed top-8 right-10 text-6xl font-bold text-[#7E6FAE]"
        style={{ fontFamily: "var(--font-average-sans)" }}
      >
        {currentIndex + 1}/{questions.length}
      </span>

      {/* Question card */}
      <div className="mb-10 rounded-3xl bg-white p-8 shadow-sm">
        <h2
          className="text-xl font-semibold text-gray-800"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          {question.question}
        </h2>
      </div>

      {/* Answer options */}
      <div className="space-y-4">
        {question.options.map((option, i) => {
          let classes =
            "w-full rounded-full px-8 py-4 text-left text-lg transition";

          if (selectedAnswer !== null) {
            if (i === question.correctIndex) {
              classes +=
                " bg-green-100 border-2 border-green-400 text-green-800";
            } else if (i === selectedAnswer) {
              classes += " bg-red-100 border-2 border-red-400 text-red-800";
            } else {
              classes += " bg-white border-2 border-gray-200 text-gray-400";
            }
          } else {
            classes +=
              " bg-white border-2 border-gray-200 text-gray-700 hover:bg-[#7E6FAE] hover:border-[#7E6FAE] hover:text-white cursor-pointer";
          }

          const showExplanationHere =
            showExplanation && i === question.correctIndex;

          return (
            <div key={option}>
              <button
                type="button"
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                className={classes}
                style={{ fontFamily: "var(--font-josefin-sans)" }}
              >
                {option}
              </button>
              {showExplanationHere && (
                <div className="mt-2 mb-1 rounded-2xl bg-[#F3F0FF] px-6 py-4 text-[#5B4D8A]">
                  <p
                    className="text-sm font-semibold"
                    style={{ fontFamily: "var(--font-josefin-sans)" }}
                  >
                    Explanation:
                  </p>
                  <p
                    className="text-sm"
                    style={{ fontFamily: "var(--font-average-sans)" }}
                  >
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Spacer so fixed button doesn't overlap content */}
      {selectedAnswer !== null && <div className="h-24" />}

      {/* Next button — fixed at bottom */}
      {selectedAnswer !== null && (
        <div className="fixed right-0 bottom-0 left-0 z-50 bg-linear-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent px-10 pt-4 pb-6">
          <button
            type="button"
            onClick={nextQuestion}
            className="mx-auto block w-full max-w-2xl cursor-pointer rounded-full bg-[#7E6FAE] py-4 text-lg font-medium text-white shadow-lg transition hover:bg-[#6B5D9A] active:bg-[#5B4D8A]"
            style={{ fontFamily: "var(--font-josefin-sans)" }}
          >
            {currentIndex + 1 >= questions.length
              ? "See Results"
              : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
