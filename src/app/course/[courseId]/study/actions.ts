"use server";

import { getSession } from "~/server/session";
import { getCourses } from "~/server/canvas";
import { fetchSelectedContent } from "~/server/content";
import { generateStudyQuestions, type StudyQuestion } from "~/server/ai";

export async function generateQuestions(
  courseId: number,
  fileIds: number[],
  linkUrls: string[],
): Promise<{ questions: StudyQuestion[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session.canvasToken) {
      return { questions: [], error: "Not authenticated. Please log in." };
    }

    const courses = await getCourses(session.canvasToken);
    const course = courses.find((c) => c.id === courseId);
    const courseName = course?.name ?? "Unknown Course";

    const content = await fetchSelectedContent(
      session.canvasToken,
      courseId,
      fileIds,
      [],
      [],
      linkUrls,
    );

    if (!content.trim()) {
      return {
        questions: [],
        error:
          "No readable content found in the selected items. Try selecting different files or pages.",
      };
    }

    const questions = await generateStudyQuestions(courseName, content);
    return { questions };
  } catch (err) {
    console.error("Failed to generate questions:", err);
    return {
      questions: [],
      error: "Failed to generate study questions. Please try again.",
    };
  }
}
