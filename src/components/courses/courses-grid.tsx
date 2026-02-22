"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { type FriendlyName, semanticSearch } from "~/app/courses/actions";
import type { Course } from "~/server/canvas";

type Props = {
  courses: Course[];
  friendlyNames: Record<number, FriendlyName>;
};

const purpleShades = [
  "#7E6FAE",
  "#9B8EC4",
  "#B8A0F0",
  "#6B5B95",
  "#8673B3",
  "#A78BFA",
  "#7B68AE",
  "#9F8FD0",
];

const sizePattern = [
  "",
  "col-span-2",
  "row-span-2",
  "",
  "",
  "col-span-2",
  "",
  "row-span-2",
  "",
  "",
];

export function CoursesGrid({ courses, friendlyNames }: Props) {
  const [search, setSearch] = useState("");
  const [matchedIds, setMatchedIds] = useState<Set<number> | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setMatchedIds(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const courseData = courses.map((c) => ({
        id: c.id,
        name: c.name,
        course_code: c.course_code,
      }));

      startTransition(async () => {
        const ids = await semanticSearch(search, courseData);
        setMatchedIds(new Set(ids));
      });
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, courses]);

  const filtered =
    matchedIds === null ? courses : courses.filter((c) => matchedIds.has(c.id));

  return (
    <>
      {/* Search bar — same style as content-picker */}
      <div className="mb-8 flex items-center justify-between">
        <h1
          className="text-5xl font-bold text-[#7E6FAE]"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          My Courses
        </h1>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
            className="w-48 rounded-full border border-gray-200 py-2 pl-9 pr-4 text-sm text-gray-600 placeholder-gray-400 focus:border-[#7E6FAE] focus:outline-none focus:ring-1 focus:ring-[#7E6FAE]"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[#7E6FAE] border-t-transparent" />
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div
          className="grid auto-rows-[280px] grid-cols-3 gap-6"
          style={{ gridAutoFlow: "dense" }}
        >
          {(() => {
            let purpleIndex = 0;

            return filtered.map((course, i) => {
              let sizeClass = sizePattern[i % sizePattern.length] ?? "";
              if (sizeClass === "row-span-2" && i >= filtered.length - 3) {
                sizeClass = "";
              }

              return (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  className={sizeClass}
                >
                  <div className="group flex h-full flex-col justify-end overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-[#7E6FAE]/40 hover:shadow-xl">
                    {course.image_download_url ? (
                      <div className="relative flex-1 overflow-hidden">
                        {/* biome-ignore lint/performance/noImgElement: Img required */}
                        <img
                          src={course.image_download_url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[#7E6FAE]/0 transition-colors duration-300 group-hover:bg-[#7E6FAE]/10" />
                      </div>
                    ) : (
                      <div
                        className="flex-1 transition-all duration-300 group-hover:brightness-110"
                        style={{
                          backgroundColor:
                            purpleShades[purpleIndex++ % purpleShades.length],
                        }}
                      />
                    )}
                    <div className="min-w-0 p-4">
                      <h2
                        className="truncate text-lg font-bold text-[#7E6FAE] transition-colors duration-300 group-hover:text-[#5B4D8A]"
                        style={{ fontFamily: "var(--font-josefin-sans)" }}
                      >
                        {friendlyNames[course.id]?.full ?? course.name}
                      </h2>
                      <p className="mt-1 truncate text-xs text-gray-400 transition-colors duration-300 group-hover:text-[#7E6FAE]">
                        {friendlyNames[course.id]?.short ?? course.course_code}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            });
          })()}
        </div>
      ) : (
        <p className="mt-12 text-center text-gray-400">
          {search
            ? `No courses matching "${search}"`
            : "No active courses found. Check your Canvas API token."}
        </p>
      )}
    </>
  );
}
