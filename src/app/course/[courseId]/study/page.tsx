import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/session";
import { NavBar } from "~/components/nav/nav-bar";
import { StudySession } from "~/components/quiz/study-session";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ files?: string; links?: string }>;
};

export default async function StudyPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  const { courseId } = await params;
  const { files, links } = await searchParams;
  const courseIdNum = parseInt(courseId, 10);

  const fileIds = (files ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  const linkUrls = (links ?? "")
    .split(",")
    .filter((s) => s.length > 0);

  if (fileIds.length === 0 && linkUrls.length === 0) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 p-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-gray-500">No content selected.</p>
            <Link
              href={`/course/${courseId}`}
              className="text-blue-600 hover:underline"
            >
              Go back and select files or pages
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/course/${courseId}`}
            className="mb-6 inline-block text-sm text-blue-600 hover:underline"
          >
            &larr; Back to content
          </Link>

          <StudySession
            courseId={courseIdNum}
            fileIds={fileIds}
            linkUrls={linkUrls}
          />
        </div>
      </main>
    </>
  );
}
