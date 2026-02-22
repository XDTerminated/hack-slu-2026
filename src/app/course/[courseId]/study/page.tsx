import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/session";
import { getCourses } from "~/server/canvas";
import { friendlyCourseNames } from "~/app/courses/actions";
import { Sidebar } from "~/components/nav/sidebar";
import { StudySession } from "~/components/quiz/study-session";
import { ResumeStudySession } from "~/components/quiz/resume-study-session";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ files?: string; pages?: string; links?: string; assignments?: string; syllabus?: string; uploads?: string; resume?: string }>;
};

export default async function StudyPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  const { courseId } = await params;
  const sp = await searchParams;
  const courseIdNum = parseInt(courseId, 10);

  // Resume mode: load quiz state from localStorage on the client
  if (sp.resume === "1") {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar />
        <main className="pl-28 pr-10 pt-8 pb-16">
          <div className="mx-auto max-w-2xl">
            <ResumeStudySession courseId={courseIdNum} />
          </div>
        </main>
      </div>
    );
  }

  const { files, pages: pagesParam, links, assignments, syllabus, uploads } = sp;

  const fileIds = (files ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  const pageUrls = (pagesParam ?? "")
    .split(",")
    .filter((s) => s.length > 0);

  const linkUrls = (links ?? "")
    .split(",")
    .filter((s) => s.length > 0);

  const assignmentIds = (assignments ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  const includeSyllabus = syllabus === "1";

  const uploadIds = (uploads ?? "")
    .split(",")
    .filter((s) => s.length > 0);

  if (fileIds.length === 0 && pageUrls.length === 0 && linkUrls.length === 0 && assignmentIds.length === 0 && !includeSyllabus && uploadIds.length === 0) {
    return (
      <div className="relative min-h-screen bg-[#FAFAFA]">
        <Sidebar />
        <main className="pl-28 pr-10 pt-8 pb-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-gray-400">No content selected.</p>
            <Link
              href={`/course/${courseId}`}
              className="text-[#7E6FAE] hover:underline"
            >
              Go back and select files or pages
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Get course name for the saved state
  const courses = await getCourses(session.canvasToken).catch(() => []);
  const course = courses.find((c) => c.id === courseIdNum);
  let courseName = course?.name ?? "Course";
  if (course) {
    const friendly = await friendlyCourseNames([{ id: course.id, name: course.name, course_code: course.course_code }]).catch(() => ({}));
    const f = (friendly as Record<number, { short?: string; full?: string }>)[course.id];
    if (f?.short && f?.full) {
      courseName = `${f.short} - ${f.full}`;
    }
  }
  const studyUrl = `/course/${courseId}/study?${new URLSearchParams(sp as Record<string, string>).toString()}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="pl-28 pr-10 pt-8 pb-16">
        <div className="mx-auto max-w-2xl">
          <StudySession
            courseId={courseIdNum}
            courseName={courseName}
            studyUrl={studyUrl}
            fileIds={fileIds}
            pageUrls={pageUrls}
            linkUrls={linkUrls}
            assignmentIds={assignmentIds}
            includeSyllabus={includeSyllabus}
            uploadIds={uploadIds}
          />
        </div>
      </main>
    </div>
  );
}
