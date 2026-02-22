import { redirect } from "next/navigation";
import { getSession } from "~/server/session";
import { getCourses } from "~/server/canvas";
import { Sidebar } from "~/components/nav/sidebar";
import { CoursesGrid } from "~/components/courses/courses-grid";
import { friendlyCourseNames } from "~/app/courses/actions";

export default async function CoursesPage() {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  let courses;
  try {
    courses = await getCourses(session.canvasToken);
  } catch {
    redirect("/login?error=expired");
  }

  const friendlyNames = await friendlyCourseNames(
    courses.map((c) => ({ id: c.id, name: c.name, course_code: c.course_code })),
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

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

        <CoursesGrid courses={courses} friendlyNames={friendlyNames} />
      </main>
    </div>
  );
}
