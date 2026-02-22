"use server";

import { db } from "~/server/db";
import { studySessions } from "~/server/db/schema";
import { eq, gte, and, sql } from "drizzle-orm";
import { getSession } from "~/server/session";
import { getSelf } from "~/server/canvas";

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
) {
  const userId = await resolveUserId();
  if (!userId) return;

  await db.insert(studySessions).values({
    canvasUserId: userId,
    courseId,
    score,
    totalQuestions,
    durationSeconds,
  });
}

export type DashboardStats = {
  studyMinutes: number;
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
};

export async function getDashboardStats(
  range: "today" | "week" | "month",
): Promise<DashboardStats> {
  const userId = await resolveUserId();
  if (!userId) {
    return { studyMinutes: 0, quizzesCompleted: 0, questionsAnswered: 0, correctAnswers: 0, streak: 0 };
  }

  const now = new Date();
  let since: Date;

  if (range === "today") {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "week") {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  } else {
    since = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const rows = await db
    .select({
      totalSeconds: sql<number>`COALESCE(SUM(${studySessions.durationSeconds}), 0)`,
      quizzes: sql<number>`COUNT(*)`,
      questions: sql<number>`COALESCE(SUM(${studySessions.totalQuestions}), 0)`,
      correct: sql<number>`COALESCE(SUM(${studySessions.score}), 0)`,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.canvasUserId, userId),
        gte(studySessions.completedAt, since),
      ),
    );

  const row = rows[0]!;

  // Calculate streak: count consecutive days with at least one session
  const streak = await calculateStreak(userId);

  return {
    studyMinutes: Math.round(Number(row.totalSeconds) / 60),
    quizzesCompleted: Number(row.quizzes),
    questionsAnswered: Number(row.questions),
    correctAnswers: Number(row.correct),
    streak,
  };
}

async function calculateStreak(userId: number): Promise<number> {
  const days = await db
    .selectDistinct({
      day: sql<string>`DATE(${studySessions.completedAt})`,
    })
    .from(studySessions)
    .where(eq(studySessions.canvasUserId, userId))
    .orderBy(sql`DATE(${studySessions.completedAt}) DESC`);

  if (days.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const firstDay = new Date(days[0]!.day);
  firstDay.setHours(0, 0, 0, 0);

  if (firstDay.getTime() !== today.getTime() && firstDay.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]!.day);
    const curr = new Date(days[i]!.day);
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
