"use server";

import Groq from "groq-sdk";
import { env } from "~/env";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export async function semanticSearch(
  query: string,
  courses: { id: number; name: string; course_code: string }[],
): Promise<number[]> {
  if (!query.trim()) return courses.map((c) => c.id);

  const courseList = courses
    .map((c) => `${c.id}: ${c.course_code} — ${c.name}`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a search engine. Given a user query and a list of college courses, return the IDs of all courses that semantically match the query. Consider subject matter, topics, abbreviations, and related concepts.

For example, if the query is "math", return courses about calculus, algebra, statistics, etc. If the query is "writing", return courses about composition, English, literature, etc.

Return JSON: { "ids": [1, 2, 3] }
If no courses match, return: { "ids": [] }
Only return IDs from the provided list.`,
      },
      {
        role: "user",
        content: `Query: "${query}"\n\nCourses:\n${courseList}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as { ids?: number[] };
  return parsed.ids ?? courses.map((c) => c.id);
}

export type FriendlyName = { short: string; full: string };

// Cache friendly names so we don't call AI on every page load
const nameCache = new Map<
  string,
  { result: Record<number, FriendlyName>; expires: number }
>();

export async function friendlyCourseNames(
  courses: { id: number; name: string; course_code: string }[],
): Promise<Record<number, FriendlyName>> {
  if (courses.length === 0) return {};

  // Build a cache key from the course IDs
  const cacheKey = courses
    .map((c) => c.id)
    .sort()
    .join(",");
  const cached = nameCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.result;
  }

  const courseList = courses
    .map((c) => `${c.id}: code="${c.course_code}" name="${c.name}"`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You clean up college course names. For each course, return two things:
1. "short" — a short friendly code like "Comp Sci 2500", "Math 1320", "English 101"
   - Turn abbreviations into readable words (e.g. "CMP_SCI" → "Comp Sci", "MATH" → "Math")
   - Keep the course number
   - Remove section numbers, semester codes, and junk
2. "full" — the clean descriptive name like "Introduction to Computer Science", "Calculus II"
   - Use the course name field to derive this
   - Clean up any junk, formatting, or codes
   - If the name is already clean, keep it as-is

Return JSON: { "courses": { "123": { "short": "Comp Sci 2500", "full": "Intro to Computer Science" } } }
Keys are course IDs as strings.`,
      },
      {
        role: "user",
        content: courseList,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as {
    courses?: Record<string, { short?: string; full?: string }>;
  };

  const result: Record<number, FriendlyName> = {};
  if (parsed.courses) {
    for (const [id, val] of Object.entries(parsed.courses)) {
      const orig = courses.find((c) => c.id === parseInt(id, 10));
      result[parseInt(id, 10)] = {
        short: val.short ?? orig?.course_code ?? "",
        full: val.full ?? orig?.name ?? "",
      };
    }
  }
  // Cache for 1 hour
  nameCache.set(cacheKey, { result, expires: Date.now() + 60 * 60 * 1000 });
  return result;
}
