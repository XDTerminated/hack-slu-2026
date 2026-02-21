import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/session";
import { getCourses, getCourseFiles, getCoursePages } from "~/server/canvas";
import { NavBar } from "~/components/nav/nav-bar";
import { ContentPicker } from "~/components/quiz/content-picker";

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
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard"
            className="mb-4 inline-block text-sm text-blue-600 hover:underline"
          >
            &larr; Back to courses
          </Link>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {course?.name ?? "Course"}
          </h1>
          <p className="mb-8 text-gray-600">
            Select the files and pages you want to study from.
          </p>

          <ContentPicker
            courseId={courseIdNum}
            files={readableFiles}
            pages={pages}
          />
        </div>
      </main>
    </>
  );
}
