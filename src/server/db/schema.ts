import { index, pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `hack-slu_${name}`);

/** Each completed quiz session */
export const studySessions = createTable(
  "study_session",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    canvasUserId: d.integer().notNull(),
    courseId: d.integer().notNull(),
    score: d.integer().notNull(),
    totalQuestions: d.integer().notNull(),
    durationSeconds: d.integer().notNull(),
    completedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("study_session_user_idx").on(t.canvasUserId),
    index("study_session_completed_idx").on(t.canvasUserId, t.completedAt),
  ],
);
