import Image from "next/image";
import { redirect } from "next/navigation";
import { friendlyCourseNames } from "~/app/courses/actions";
import { Sidebar } from "~/components/nav/sidebar";
import { ContentPicker } from "~/components/quiz/content-picker";
import type { CanvasFile, PageSummary } from "~/server/canvas";
import {
  getCourseAssignments,
  getCourseFiles,
  getCoursePages,
  getCourseSyllabus,
  getCourses,
  getFile,
  getFrontPage,
  getModuleItems,
  getModules,
  getPage,
} from "~/server/canvas";
import { getSession } from "~/server/session";
import {
  extractCanvasFileIds,
  extractCanvasPageSlugs,
  extractLinks,
  getGoogleDriveDownloadUrl,
  isDirectFileUrl,
} from "~/utils/extract-links";

type Props = {
  params: Promise<{ courseId: string }>;
};

/** Collect unique page slugs into allPages, returns the seen set */
function _addPages(
  allPages: PageSummary[],
  seen: Set<string>,
  discovered: { slug: string; title: string }[],
) {
  for (const p of discovered) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      allPages.push({ page_id: 0, title: p.title, url: p.slug });
    }
  }
}

export default async function CoursePage({ params }: Props) {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }
  const token = session.canvasToken;

  const { courseId } = await params;
  const courseIdNum = parseInt(courseId, 10);

  const [courses, files, pages, modules, syllabusBody, assignments, frontPage] =
    await Promise.all([
      getCourses(token),
      getCourseFiles(token, courseIdNum).catch(() => []),
      getCoursePages(token, courseIdNum).catch(() => []),
      getModules(token, courseIdNum).catch(() => []),
      getCourseSyllabus(token, courseIdNum).catch(() => null),
      getCourseAssignments(token, courseIdNum).catch(() => []),
      getFrontPage(token, courseIdNum).catch(() => null),
    ]);

  const course = courses.find((c) => c.id === courseIdNum);

  const friendly = await friendlyCourseNames(
    course
      ? [{ id: course.id, name: course.name, course_code: course.course_code }]
      : [],
  ).catch(() => ({}));
  const courseName =
    (friendly as Record<number, { full?: string }>)[courseIdNum]?.full ??
    course?.name ??
    "Course";

  // Fetch full module items for truncated modules
  if (modules.length > 0) {
    const truncated = modules.filter(
      (m) => m.items_count > (m.items?.length ?? 0),
    );
    if (truncated.length > 0) {
      const fullItems = await Promise.all(
        truncated.map((m) =>
          getModuleItems(token, courseIdNum, m.id).catch(() => []),
        ),
      );
      for (let i = 0; i < truncated.length; i++) {
        const module = truncated[i];
        if (module !== undefined) {
          module.items = fullItems[i];
        }
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
        if (
          item.type === "File" &&
          item.content_id &&
          !seenFileIds.has(item.content_id)
        ) {
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
        if (
          !seenExtUrls.has(url) &&
          (isDirectFileUrl(url) || !!getGoogleDriveDownloadUrl(url))
        ) {
          seenExtUrls.add(url);
          externalLinks.push({ url, title: item.title });
        }
      }
    }
  }

  // Discover external file links from syllabus, assignments, and front page
  function collectLinksFromHtml(html: string) {
    for (const url of extractLinks(html)) {
      if (
        !seenExtUrls.has(url) &&
        (isDirectFileUrl(url) || !!getGoogleDriveDownloadUrl(url))
      ) {
        seenExtUrls.add(url);
        // Use filename from URL as title
        try {
          const pathname = new URL(url).pathname;
          const filename = pathname.split("/").pop() ?? "Linked File";
          externalLinks.push({ url, title: decodeURIComponent(filename) });
        } catch {
          externalLinks.push({ url, title: "Linked File" });
        }
      }
    }
  }

  if (frontPage?.body) collectLinksFromHtml(frontPage.body);
  if (syllabusBody) collectLinksFromHtml(syllabusBody);
  for (const assignment of assignments) {
    if (assignment.description) collectLinksFromHtml(assignment.description);
  }

  // Discover Canvas page links from HTML (syllabus, assignments, front page)
  // This catches pages even when the Pages listing API returns 403
  const seenPageUrls = new Set(pages.map((p) => p.url));
  const allPages = [...pages];

  // Also discover pages from module items of type "Page"
  for (const mod of modules) {
    for (const item of mod.items ?? []) {
      if (
        item.type === "Page" &&
        item.page_url &&
        !seenPageUrls.has(item.page_url)
      ) {
        seenPageUrls.add(item.page_url);
        allPages.push({ page_id: 0, title: item.title, url: item.page_url });
      }
    }
  }

  const htmlSources = [
    syllabusBody,
    frontPage?.body,
    ...assignments.map((a) => a.description).filter(Boolean),
  ].filter(Boolean) as string[];
  for (const html of htmlSources) {
    for (const { slug, title } of extractCanvasPageSlugs(html, courseIdNum)) {
      if (!seenPageUrls.has(slug)) {
        seenPageUrls.add(slug);
        allPages.push({ page_id: 0, title, url: slug });
      }
    }
  }

  // Extract Canvas file IDs from syllabus, assignments, front page HTML
  // Extract Canvas file IDs from all HTML sources and page bodies
  const knownFileIds = new Set(allFiles.map((f) => f.id));
  const discoveredFileIds = new Set<number>();
  for (const html of htmlSources) {
    for (const id of extractCanvasFileIds(html)) {
      if (!knownFileIds.has(id)) discoveredFileIds.add(id);
    }
  }

  if (allPages.length > 0) {
    const pageBodies = await Promise.all(
      allPages.slice(0, 50).map((p) =>
        getPage(token, courseIdNum, p.url)
          .then((full: { body?: string }) => full.body ?? "")
          .catch(() => ""),
      ),
    );
    for (const body of pageBodies) {
      if (body) {
        collectLinksFromHtml(body);
        for (const id of extractCanvasFileIds(body)) {
          if (!knownFileIds.has(id)) discoveredFileIds.add(id);
        }
      }
    }
  }

  // Fetch all discovered Canvas files
  if (discoveredFileIds.size > 0) {
    const fetched = await Promise.all(
      Array.from(discoveredFileIds)
        .slice(0, 200)
        .map((id) => getFile(token, id).catch(() => null)),
    );
    for (const f of fetched) {
      if (f) allFiles.push(f);
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

  // Prepare assignments for the content picker (only those with descriptions)
  const selectableAssignments = assignments
    .filter((a) => a.description && a.description.trim().length > 0)
    .map((a) => ({ id: a.id, name: a.name }));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      {/* Main content */}
      <main className="pt-8 pr-10 pb-16 pl-28">
        {/* Header */}
        <div className="mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
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
            assignments={selectableAssignments}
            hasSyllabus={!!syllabusBody}
          />
        </div>
      </main>
    </div>
  );
}
