import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/session";
import { Sidebar } from "~/components/nav/sidebar";
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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
          <StudySession
            courseId={courseIdNum}
            fileIds={fileIds}
            linkUrls={linkUrls}
          />
        </div>

        <StudySession
          courseId={courseIdNum}
          fileIds={fileIds}
          pageUrls={pageUrls}
        />
      </main>
    </div>
  );
}
