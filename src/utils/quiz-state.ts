import type { StudyQuestion } from "~/server/ai";

const STORAGE_KEY = "cognify-quiz-state";

export type SavedQuizState = {
  courseId: number;
  courseName: string;
  questions: StudyQuestion[];
  currentIndex: number;
  score: number;
  startTime: number;
  /** URL to navigate back to for this quiz */
  studyUrl: string;
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
