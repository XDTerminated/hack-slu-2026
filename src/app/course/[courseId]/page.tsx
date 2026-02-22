import { redirect } from "next/navigation";

import { getSession } from "~/server/session";
import {
  getCourses,
  getCourseFiles,
  getModules,
  getModuleItems,
  getFile,
} from "~/server/canvas";
import type { CanvasFile } from "~/server/canvas";
import {
  getGoogleDriveDownloadUrl,
  isDirectFileUrl,
} from "~/utils/extract-links";
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
  const token = session.canvasToken;

  const { courseId } = await params;
  const courseIdNum = parseInt(courseId, 10);

  const [courses, files, modules] = await Promise.all([
    getCourses(token),
    getCourseFiles(token, courseIdNum).catch(() => []),
    getModules(token, courseIdNum).catch(() => []),
  ]);

  const course = courses.find((c) => c.id === courseIdNum);

  const friendly = await friendlyCourseNames(
    course ? [{ id: course.id, name: course.name, course_code: course.course_code }] : [],
  ).catch(() => ({}));
  const courseName = (friendly as Record<number, { full?: string }>)[courseIdNum]?.full ?? course?.name ?? "Course";

  // Fetch full module items for truncated modules
  if (modules.length > 0) {
    const truncated = modules.filter(
      (m) => m.items_count > (m.items?.length ?? 0),
    );
    if (truncated.length > 0) {
      const fullItems = await Promise.all(
        truncated.map((m) => getModuleItems(token, courseIdNum, m.id).catch(() => [])),
      );
      for (let i = 0; i < truncated.length; i++) {
        truncated[i]!.items = fullItems[i];
      }
    }
  }

  // Merge files from modules with Files API results
  let allFiles: CanvasFile[] = files;
  if (modules.length > 0) {
    const seenFileIds = new Set(allFiles.map((f) => f.id));
    const moduleFileIds = new Set<number>();
    for (const mod of modules) {
      for (const item of mod.items ?? []) {
        if (item.type === "File" && item.content_id && !seenFileIds.has(item.content_id)) {
          moduleFileIds.add(item.content_id);
        }
      }
    }
    if (moduleFileIds.size > 0) {
      const fetched = await Promise.all(
        Array.from(moduleFileIds)
          .slice(0, 200)
          .map((id) => getFile(token, id).catch(() => null)),
      );
      allFiles = [
        ...allFiles,
        ...fetched.filter((f): f is CanvasFile => f !== null),
      ];
    }
  }

  // Collect external file links from module ExternalUrl items
  const externalLinks: { url: string; title: string }[] = [];
  const seenExtUrls = new Set<string>();
  for (const mod of modules) {
    for (const item of mod.items ?? []) {
      if (item.type === "ExternalUrl" && item.external_url) {
        const url = item.external_url;
        if (!seenExtUrls.has(url) && (isDirectFileUrl(url) || !!getGoogleDriveDownloadUrl(url))) {
          seenExtUrls.add(url);
          externalLinks.push({ url, title: item.title });
        }
      }
    }
  }

  // Filter files to only show readable/extractable content types
  const readableFiles = allFiles.filter((f) => {
    const ct = f["content-type"];
    return (
      ct === "application/pdf" ||
      (ct.startsWith("text/") && ct !== "text/csv") ||
      ct.includes("html") ||
      ct.includes("presentation") ||
      ct.includes("powerpoint") ||
      ct.includes("wordprocessing") ||
      ct.includes("msword") ||
      ct.includes("spreadsheet") ||
      ct.includes("excel") ||
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

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {course?.name ?? "Course"}
          </h1>
          <p className="mb-8 text-gray-600">
            Select the content you want to study from.
          </p>

        <div>
          <ContentPicker
            courseId={courseIdNum}
            courseCode={courseName}
            files={readableFiles}
            externalLinks={externalLinks}
          />
        </div>
      </main>
    </div>
  );
}
