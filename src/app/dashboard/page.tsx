import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/session";
import { getCourses } from "~/server/canvas";
import { NavBar } from "~/components/nav/nav-bar";
import { Card } from "~/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  const courses = await getCourses(session.canvasToken);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Your Courses
          </h1>
          <p className="mb-8 text-gray-600">
            Select a course to start studying
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Card className="transition hover:border-blue-300 hover:shadow-md">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {course.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.course_code}
                  </p>
                </Card>
              </Link>
            ))}
          </div>

          {courses.length === 0 && (
            <p className="text-center text-gray-500">
              No active courses found. Check your Canvas API token.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
