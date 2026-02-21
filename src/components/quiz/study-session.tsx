"use client";

import { useState, useEffect } from "react";
import { generateQuestions } from "~/app/course/[courseId]/study/actions";
import type { StudyQuestion } from "~/server/ai";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Card } from "~/components/ui/card";

type Props = {
  courseId: number;
  moduleIds: number[];
};

export function StudySession({ courseId, moduleIds }: Props) {
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await generateQuestions(courseId, moduleIds);
      if (result.error) {
        setError(result.error);
      } else {
        setQuestions(result.questions);
      }
      setLoading(false);
    }
    void load();
  }, [courseId, moduleIds]);

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
        <p className="mt-4 text-gray-600">
          Analyzing course content and generating questions...
        </p>
        <p className="mt-1 text-sm text-gray-400">
          This may take 10-20 seconds
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-700">{error}</div>
    );
  }

  if (finished) {
    const percentage = questions.length > 0 ? score / questions.length : 0;

    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Study Complete!</h2>
        <p className="mt-4 text-5xl font-bold text-blue-600">
          {score}/{questions.length}
        </p>
        <p className="mt-2 text-gray-600">
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm text-gray-500">Score: {score}</span>
      </div>

      <div className="mb-6 h-2 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {question.question}
        </h2>
      </Card>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          let style =
            "w-full rounded-lg border-2 border-gray-200 p-4 text-left transition hover:border-blue-300";

          if (selectedAnswer !== null) {
            if (i === question.correctIndex) {
              style =
                "w-full rounded-lg border-2 border-green-500 bg-green-50 p-4 text-left";
            } else if (i === selectedAnswer) {
              style =
                "w-full rounded-lg border-2 border-red-500 bg-red-50 p-4 text-left";
            } else {
              style =
                "w-full rounded-lg border-2 border-gray-200 p-4 text-left opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selectedAnswer !== null}
              className={style}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-blue-900">
          <p className="font-semibold">Explanation:</p>
          <p>{question.explanation}</p>
        </div>
      )}

      {selectedAnswer !== null && (
        <Button onClick={nextQuestion} className="mt-6 w-full py-3 text-lg">
          {currentIndex + 1 >= questions.length
            ? "See Results"
            : "Next Question"}
        </Button>
      )}
    </div>
  );
}
