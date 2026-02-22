import { redirect } from "next/navigation";
import { friendlyCourseNames } from "~/app/courses/actions";
import { CoursesGrid } from "~/components/courses/courses-grid";
import { Sidebar } from "~/components/nav/sidebar";
import { type Course, getCourses } from "~/server/canvas";
import { getSession } from "~/server/session";

export default async function CoursesPage() {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  let courses: Course[] = [];
  try {
    courses = await getCourses(session.canvasToken);
  } catch {
    redirect("/login?error=expired");
  }

  const friendlyNames = await friendlyCourseNames(
    courses.map((c) => ({
      id: c.id,
      name: c.name,
      course_code: c.course_code,
    })),
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="pl-28 pr-10 pt-8 pb-16">
        <CoursesGrid courses={courses} friendlyNames={friendlyNames} />
      </main>
    </div>
  );
}
