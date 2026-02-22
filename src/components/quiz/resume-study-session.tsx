"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StudySession } from "~/components/quiz/study-session";
import { clearQuizState, loadQuizState } from "~/utils/quiz-state";

type Props = { courseId: number };

export function ResumeStudySession({ courseId }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const state = typeof window !== "undefined" ? loadQuizState() : null;

  useEffect(() => {
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (state?.courseId !== courseId) {
    clearQuizState();
    router.replace(`/course/${courseId}`);
    return null;
  }

  return (
    <StudySession
      courseId={state.courseId}
      courseName={state.courseName}
      studyUrl={state.studyUrl}
      fileIds={[]}
      pageUrls={[]}
      linkUrls={[]}
      assignmentIds={[]}
      includeSyllabus={false}
      uploadIds={[]}
      resumeState={state}
    />
  );
}
