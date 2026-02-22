"use client";

import { useState, useEffect } from "react";
import { generateQuestions } from "~/app/course/[courseId]/study/actions";
import type { StudyQuestion } from "~/server/ai";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

type Props = {
  courseId: number;
  fileIds: number[];
<<<<<<< Updated upstream
  pageUrls: string[];
};

export function StudySession({ courseId, fileIds, pageUrls }: Props) {
=======
  linkUrls: string[];
  uploadIds: string[];
};

export function StudySession({ courseId, fileIds, linkUrls, uploadIds }: Props) {
>>>>>>> Stashed changes
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
<<<<<<< Updated upstream
      const result = await generateQuestions(courseId, fileIds, pageUrls);
=======
      const result = await generateQuestions(courseId, fileIds, linkUrls, uploadIds);
      if (cancelled) return;
>>>>>>> Stashed changes
      if (result.error) {
        setError(result.error);
      } else {
        setQuestions(result.questions);
      }
      setLoading(false);
    }
    void load();
<<<<<<< Updated upstream
  }, [courseId, fileIds, pageUrls]);
=======
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
>>>>>>> Stashed changes

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
          className="mt-6 text-7xl font-bold text-[#DCD8FF]"
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
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="relative">
      {/* Question counter — fixed top right of page */}
      <span
        className="fixed right-10 top-8 text-6xl font-bold text-[#DCD8FF]"
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
              classes += " bg-green-100 border-2 border-green-400 text-green-800";
            } else if (i === selectedAnswer) {
              classes += " bg-red-100 border-2 border-red-400 text-red-800";
            } else {
              classes += " bg-white border-2 border-gray-200 text-gray-400";
            }
          } else {
            classes +=
              " bg-white border-2 border-gray-200 text-gray-700 hover:bg-[#DCD8FF] hover:border-[#DCD8FF] hover:text-white cursor-pointer";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selectedAnswer !== null}
              className={classes}
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-8 rounded-3xl bg-[#F3F0FF] p-6 text-[#5B4D8A]">
          <p
            className="font-semibold"
            style={{ fontFamily: "var(--font-josefin-sans)" }}
          >
            Explanation:
          </p>
          <p style={{ fontFamily: "var(--font-average-sans)" }}>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      {selectedAnswer !== null && (
        <button
          onClick={nextQuestion}
          className="mt-8 w-full rounded-full bg-[#DCD8FF] py-4 text-lg font-medium text-white transition hover:bg-[#C8C2F0]"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          {currentIndex + 1 >= questions.length
            ? "See Results"
            : "Next Question"}
        </button>
      )}
    </div>
  );
}
