import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/session";
import { getCourses, getModules } from "~/server/canvas";
import { NavBar } from "~/components/nav/nav-bar";
import { ModulePicker } from "~/components/quiz/module-picker";

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

  const [courses, modules] = await Promise.all([
    getCourses(session.canvasToken),
    getModules(session.canvasToken, courseIdNum),
  ]);

  const course = courses.find((c) => c.id === courseIdNum);

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
            Select the modules you want to study, then click Start Studying.
          </p>

          <ModulePicker courseId={courseIdNum} modules={modules} />
        </div>
      </main>
    </>
  );
}
