import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/session";
import { Sidebar } from "~/components/nav/sidebar";
import { StudySession } from "~/components/quiz/study-session";

type Props = {
  params: Promise<{ courseId: string }>;
<<<<<<< Updated upstream
  searchParams: Promise<{ files?: string; pages?: string }>;
=======
  searchParams: Promise<{ files?: string; links?: string; uploads?: string }>;
>>>>>>> Stashed changes
};

export default async function StudyPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  const { courseId } = await params;
<<<<<<< Updated upstream
  const { files, pages } = await searchParams;
=======
  const { files, links, uploads } = await searchParams;
>>>>>>> Stashed changes
  const courseIdNum = parseInt(courseId, 10);

  const fileIds = (files ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  const pageUrls = (pages ?? "")
    .split(",")
    .filter((s) => s.length > 0);

<<<<<<< Updated upstream
  if (fileIds.length === 0 && pageUrls.length === 0) {
=======
  const uploadIds = (uploads ?? "")
    .split(",")
    .filter((s) => s.length > 0);

  if (fileIds.length === 0 && linkUrls.length === 0 && uploadIds.length === 0) {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

      <main className="pl-28 pr-10 pt-8 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cognify-logo-purple.svg"
              alt="Cognify"
              style={{ width: "200px", height: "auto", maxWidth: "none" }}
            />
            <Link
              href={`/course/${courseId}`}
              className="mt-4 inline-block text-sm text-[#7E6FAE] hover:underline"
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              &larr; Back to content
            </Link>
          </div>
=======
      <main className="pl-28 pr-10 pt-8 pb-16">
        <div className="mx-auto max-w-2xl">
          <StudySession
            courseId={courseIdNum}
            fileIds={fileIds}
            linkUrls={linkUrls}
            uploadIds={uploadIds}
          />
>>>>>>> Stashed changes
        </div>
      </main>
    </div>
  );
}
