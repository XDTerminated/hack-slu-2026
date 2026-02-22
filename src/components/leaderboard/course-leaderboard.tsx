"use client";

import { useEffect, useState } from "react";
import { Spinner } from "~/components/ui/spinner";
import { getCourseLeaderboard, type LeaderboardEntry } from "~/server/stats";

type Props = {
  courseId: number;
};

export function CourseLeaderboard({ courseId }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCourseLeaderboard(courseId)
      .then((data) => {
        if (cancelled) return;
        setEntries(data.entries);
        setCurrentUserId(data.currentUserId);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leaderboard fetch failed:", err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-gray-100 bg-white py-12 shadow-sm">
        <Spinner />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2
          className="mb-4 text-2xl font-bold text-[#7E6FAE]"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          Leaderboard
        </h2>
        <p
          className="py-6 text-center text-gray-400"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          No quiz data yet. Be the first to study!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <h2
        className="mb-6 text-2xl font-bold text-[#7E6FAE]"
        style={{ fontFamily: "var(--font-josefin-sans)" }}
      >
        Leaderboard
      </h2>

      {/* Column headers */}
      <div
        className="mb-2 grid grid-cols-[2rem_1fr_5rem_5rem] items-center gap-4 px-4 text-xs font-medium uppercase tracking-wide text-gray-400"
        style={{ fontFamily: "var(--font-josefin-sans)" }}
      >
        <span>#</span>
        <span>Student</span>
        <span className="text-right">Quizzes</span>
        <span className="text-right">Accuracy</span>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.canvasUserId === currentUserId;

          let rankColor = "text-gray-400";
          if (rank === 1) rankColor = "text-yellow-500";
          else if (rank === 2) rankColor = "text-gray-400";
          else if (rank === 3) rankColor = "text-amber-700";

          return (
            <div
              key={entry.canvasUserId}
              className={`group grid grid-cols-[2rem_1fr_5rem_5rem] items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
                isCurrentUser
                  ? "border-2 border-[#7E6FAE]/30 bg-[#F3F0FF]"
                  : "hover:bg-[#F8F6FF]"
              }`}
            >
              {/* Rank */}
              <span
                className={`text-2xl font-bold ${rankColor}`}
                style={{ fontFamily: "var(--font-average-sans)" }}
              >
                {rank}
              </span>

              {/* Name */}
              <div className="min-w-0">
                <span
                  className={`truncate text-base font-medium ${
                    isCurrentUser ? "text-[#5B4D8A]" : "text-gray-700"
                  } transition-colors duration-200 group-hover:text-[#5B4D8A]`}
                  style={{ fontFamily: "var(--font-josefin-sans)" }}
                >
                  {entry.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-[#7E6FAE]">(you)</span>
                  )}
                </span>
              </div>

              {/* Quiz count */}
              <span
                className="text-right text-lg font-bold text-[#797979] transition-colors duration-200 group-hover:text-[#7E6FAE]"
                style={{ fontFamily: "var(--font-average-sans)" }}
              >
                {entry.quizzesCompleted}
              </span>

              {/* Accuracy */}
              <div>
                <span
                  className="block text-right text-lg font-bold text-[#7E6FAE]"
                  style={{ fontFamily: "var(--font-average-sans)" }}
                >
                  {entry.accuracyPercent}%
                </span>
                <div className="mt-1 h-1.5 rounded-full bg-[#F0EEF8]">
                  <div
                    className="h-1.5 rounded-full bg-[#7E6FAE] transition-shadow duration-200 group-hover:shadow-[0_0_6px_rgba(126,111,174,0.4)]"
                    style={{ width: `${entry.accuracyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
