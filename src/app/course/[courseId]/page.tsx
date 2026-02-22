import { redirect } from "next/navigation";

import { getSession } from "~/server/session";
import { getCourses, getCourseFiles, getCoursePages } from "~/server/canvas";
import { Sidebar } from "~/components/nav/sidebar";
import { ContentPicker } from "~/components/quiz/content-picker";
import { friendlyCourseNames } from "~/app/courses/actions";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function CoursePage({ params }: Props) {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  const { courseId } = await params;
  const courseIdNum = parseInt(courseId, 10);

  const [courses, files, pages] = await Promise.all([
    getCourses(session.canvasToken),
    getCourseFiles(session.canvasToken, courseIdNum).catch(() => []),
    getCoursePages(session.canvasToken, courseIdNum).catch(() => []),
  ]);

  const course = courses.find((c) => c.id === courseIdNum);

  const friendly = await friendlyCourseNames(
    course ? [{ id: course.id, name: course.name, course_code: course.course_code }] : [],
  );
  const courseName = friendly[courseIdNum]?.full ?? course?.name ?? "Course";

  // Filter files to only show readable content types
  const readableFiles = files.filter((f) => {
    const ct = f["content-type"];
    return (
      ct === "application/pdf" ||
      ct.startsWith("text/") ||
      ct.includes("html") ||
      ct === "application/json" ||
      ct === "application/rtf"
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      {/* Main content */}
      <main className="pl-28 pr-10 pt-8 pb-16">
        {/* Header */}
        <div className="mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cognify-logo-purple.svg"
            alt="Cognify"
            style={{ width: "200px", height: "auto", maxWidth: "none" }}
          />
        </div>

        <h1
          className="mb-8 text-5xl text-[#DCD8FF]"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          My Courses
        </h1>

        <div>
          <ContentPicker
            courseId={courseIdNum}
            courseCode={courseName}
            files={readableFiles}
            pages={pages}
          />
        </div>
      </main>
    </div>
  );
}
