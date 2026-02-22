"use server";

import { generateMockExam, type MockExam } from "~/server/ai";
import { getUploads } from "~/server/upload-store";

export async function generateExam(
  uploadIds: string[],
): Promise<{ exam: MockExam | null; error?: string }> {
  try {
    const content = getUploads(uploadIds);

    if (!content.trim()) {
      return {
        exam: null,
        error:
          "No readable content found in the uploaded files. Try uploading different files.",
      };
    }

    const exam = await generateMockExam(content);
    return { exam };
  } catch (err) {
    console.error("Failed to generate mock exam:", err);
    return {
      exam: null,
      error: "Failed to generate mock exam. Please try again.",
    };
  }
}
