"use server";

import { generateStudyQuestions, type StudyQuestion } from "~/server/ai";
import { getCourses } from "~/server/canvas";
import { fetchSelectedContent } from "~/server/content";
import { getSession } from "~/server/session";
import { getUploads } from "~/server/upload-store";

export async function generateQuestions(
  courseId: number,
  fileIds: number[],
  pageUrls: string[] = [],
  linkUrls: string[],
  assignmentIds: number[] = [],
  includeSyllabus = false,
  uploadIds: string[] = [],
): Promise<{ questions: StudyQuestion[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session.canvasToken) {
      return { questions: [], error: "Not authenticated. Please log in." };
    }

    const courses = await getCourses(session.canvasToken);
    const course = courses.find((c) => c.id === courseId);
    const courseName = course?.name ?? "Unknown Course";

    const canvasContent = await fetchSelectedContent(
      session.canvasToken,
      courseId,
      fileIds,
      pageUrls,
      assignmentIds,
      linkUrls,
      includeSyllabus,
    );
    const uploadContent = uploadIds.length > 0 ? getUploads(uploadIds) : "";
    const content = [canvasContent, uploadContent]
      .filter(Boolean)
      .join("\n\n---\n\n");

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
