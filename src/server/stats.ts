"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { getCourses, getSelf } from "~/server/canvas";
import { db } from "~/server/db";
import { studySessions } from "~/server/db/schema";
import { getSession } from "~/server/session";

/** Resolve the Canvas user ID, backfilling session if needed */
async function resolveUserId(): Promise<number | null> {
  const session = await getSession();
  if (session.canvasUserId) return session.canvasUserId;
  if (!session.canvasToken) return null;
  try {
    const self = await getSelf(session.canvasToken);
    session.canvasUserId = self.id;
    await session.save();
    return self.id;
  } catch {
    return null;
  }
}

export async function recordStudySession(
  courseId: number,
  score: number,
  totalQuestions: number,
  durationSeconds: number,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await resolveUserId();
  if (!userId) {
    console.error("[recordStudySession] resolveUserId returned null");
    return { ok: false, error: "Not authenticated" };
  }

  try {
    await db.insert(studySessions).values({
      canvasUserId: userId,
      courseId,
      score,
      totalQuestions,
      durationSeconds,
    });
    return { ok: true };
  } catch (err) {
    console.error("[recordStudySession] DB insert failed:", err);
    return { ok: false, error: String(err) };
  }
}

export type CourseAccuracy = {
  courseId: number;
  questionsAnswered: number;
  correctAnswers: number;
};

export type DailyActivity = {
  date: string;
  questions: number;
  quizzes: number;
  avgScore: number;
};

export type DashboardStats = {
  studyMinutes: number;
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  perCourse: CourseAccuracy[];
  dailyActivity: DailyActivity[];
};

export async function getDashboardStats(
  range: "today" | "week" | "month",
): Promise<DashboardStats> {
  const empty: DashboardStats = {
    studyMinutes: 0,
    quizzesCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    perCourse: [],
    dailyActivity: [],
  };

  const userId = await resolveUserId();
  if (!userId) return empty;

  const now = new Date();
  let since: Date;

  if (range === "today") {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "week") {
    since = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    );
  } else {
    since = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const rangeFilter = and(
    eq(studySessions.canvasUserId, userId),
    gte(studySessions.completedAt, since),
  );

  const [rows, courseRows, dailyRows] = await Promise.all([
    db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(${studySessions.durationSeconds}), 0)`,
        quizzes: sql<number>`COUNT(*)`,
        questions: sql<number>`COALESCE(SUM(${studySessions.totalQuestions}), 0)`,
        correct: sql<number>`COALESCE(SUM(${studySessions.score}), 0)`,
      })
      .from(studySessions)
      .where(rangeFilter),
    db
      .select({
        courseId: studySessions.courseId,
        questions: sql<number>`COALESCE(SUM(${studySessions.totalQuestions}), 0)`,
        correct: sql<number>`COALESCE(SUM(${studySessions.score}), 0)`,
      })
      .from(studySessions)
      .where(rangeFilter)
      .groupBy(studySessions.courseId),
    db
      .select({
        date: sql<string>`DATE(${studySessions.completedAt})`,
        questions: sql<number>`COALESCE(SUM(${studySessions.totalQuestions}), 0)`,
        quizzes: sql<number>`COUNT(*)`,
        avgScore: sql<number>`ROUND(AVG(${studySessions.score}::float / NULLIF(${studySessions.totalQuestions}, 0) * 100))`,
      })
      .from(studySessions)
      .where(rangeFilter)
      .groupBy(sql`DATE(${studySessions.completedAt})`)
      .orderBy(sql`DATE(${studySessions.completedAt})`),
  ]);

  const row = rows[0];
  if (row === undefined) return empty;

  const streak = await calculateStreak(userId);

  const perCourse: CourseAccuracy[] = courseRows.map((r) => ({
    courseId: Number(r.courseId),
    questionsAnswered: Number(r.questions),
    correctAnswers: Number(r.correct),
  }));

  const dailyActivity: DailyActivity[] = dailyRows.map((r) => ({
    date: String(r.date),
    questions: Number(r.questions),
    quizzes: Number(r.quizzes),
    avgScore: Number(r.avgScore) || 0,
  }));

  return {
    studyMinutes: Math.round(Number(row.totalSeconds) / 60),
    quizzesCompleted: Number(row.quizzes),
    questionsAnswered: Number(row.questions),
    correctAnswers: Number(row.correct),
    streak,
    perCourse,
    dailyActivity,
  };
}

export async function getCourseNames(
  courseIds: number[],
): Promise<Record<number, string>> {
  if (courseIds.length === 0) return {};
  const session = await getSession();
  if (!session.canvasToken) return {};
  try {
    const courses = await getCourses(session.canvasToken);
    const map: Record<number, string> = {};
    for (const id of courseIds) {
      const course = courses.find((c) => c.id === id);
      map[id] = course?.course_code ?? `Course ${id}`;
    }
    return map;
  } catch {
    return Object.fromEntries(courseIds.map((id) => [id, `Course ${id}`]));
  }
}

async function calculateStreak(userId: number): Promise<number> {
  const days = await db
    .selectDistinct({
      day: sql<string>`DATE(${studySessions.completedAt})`,
    })
    .from(studySessions)
    .where(eq(studySessions.canvasUserId, userId))
    .orderBy(sql`DATE(${studySessions.completedAt}) DESC`);

  if (days[0] === undefined) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const firstDay = new Date(days[0].day);
  firstDay.setHours(0, 0, 0, 0);

  if (
    firstDay.getTime() !== today.getTime() &&
    firstDay.getTime() !== yesterday.getTime()
  ) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const lastDay = days[i - 1];
    const currentDay = days[i];
    if (lastDay === undefined || currentDay === undefined) {
      break;
    }

    const prev = new Date(lastDay.day);
    const curr = new Date(currentDay.day);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);

    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
