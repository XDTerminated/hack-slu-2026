"use client";

import { useState } from "react";
import type { DailyActivity } from "~/server/stats";

type Tab = "questions" | "quizzes" | "score";

const tabs: Tab[] = ["questions", "quizzes", "score"];
const tabLabels: Record<Tab, string> = {
  questions: "Questions",
  quizzes: "Quizzes",
  score: "Score",
};

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function ActivityChart({
  dailyActivity,
}: {
  dailyActivity: DailyActivity[];
}) {
  const [tabIndex, setTabIndex] = useState(0);
  const tab = tabs[tabIndex] ?? "questions";

  function prev() {
    setTabIndex((i) => (i - 1 + tabs.length) % tabs.length);
  }
  function next() {
    setTabIndex((i) => (i + 1) % tabs.length);
  }

  const values = dailyActivity.map((d) => {
    if (tab === "questions") return d.questions;
    if (tab === "quizzes") return d.quizzes;
    return d.avgScore;
  });

  const max = Math.max(...values, 1);
  const suffix = tab === "score" ? "%" : "";

  if (dailyActivity.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <span
          className="text-lg text-[#D0D0D0]"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          No activity yet
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pt-3 pb-4">
      {/* View label */}
      <span
        className="mb-2 text-center text-sm font-medium text-[#797979]"
        style={{ fontFamily: "var(--font-josefin-sans)" }}
      >
        {tabLabels[tab]}
      </span>

      {/* Chart with side arrows */}
      <div className="flex flex-1 items-center gap-2">
        <button
          type="button"
          onClick={prev}
          className="cursor-pointer text-lg text-[#B0B0B0] transition hover:text-[#7E6FAE]"
        >
          &#9664;
        </button>

        <div className="flex flex-1 items-end gap-1 self-stretch">
          {dailyActivity.map((d, i) => {
            const val = values[i] ?? 0;
            const pct = max > 0 ? (val / max) * 100 : 0;
            return (
              <div
                key={d.date}
                className="group flex min-w-0 flex-1 flex-col items-center"
              >
                {/* Value label on hover */}
                <span
                  className="mb-1 text-xs font-bold text-[#5B4D8A] opacity-0 transition group-hover:opacity-100"
                  style={{ fontFamily: "var(--font-average-sans)" }}
                >
                  {val}
                  {suffix}
                </span>
                {/* Bar */}
                <div
                  className="w-full rounded-t-md bg-[#7E6FAE] transition-all group-hover:bg-[#5B4D8A]"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    minHeight: "4px",
                  }}
                />
                {/* Day label */}
                <span
                  className="mt-1 text-[10px] leading-tight text-[#C0C0C0]"
                  style={{ fontFamily: "var(--font-average-sans)" }}
                >
                  {dailyActivity.length <= 7
                    ? formatDay(d.date)
                    : formatDate(d.date)}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={next}
          className="cursor-pointer text-lg text-[#B0B0B0] transition hover:text-[#7E6FAE]"
        >
          &#9654;
        </button>
      </div>
    </div>
  );
}
