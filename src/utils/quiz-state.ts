import type { MockExam, StudyQuestion } from "~/server/ai";

const STORAGE_KEY = "cognify-quiz-state";
const EXAM_STORAGE_KEY = "cognify-exam-state";

export type SavedQuizState = {
  courseId: number;
  courseName: string;
  questions: StudyQuestion[];
  currentIndex: number;
  score: number;
  startTime: number;
  /** URL to navigate back to for this quiz */
  studyUrl: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type SavedExamState = {
  exam: MockExam;
  /** Display name derived from uploaded file names */
  name: string;
  createdAt: number;
};

export function saveQuizState(state: SavedQuizState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadQuizState(): SavedQuizState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedQuizState;
  } catch {
    return null;
  }
}

export function clearQuizState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function saveExamState(state: SavedExamState): void {
  try {
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadExamState(): SavedExamState | null {
  try {
    const raw = localStorage.getItem(EXAM_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedExamState;
  } catch {
    return null;
  }
}

export function clearExamState(): void {
  try {
    localStorage.removeItem(EXAM_STORAGE_KEY);
  } catch {
    // ignore
  }
}
