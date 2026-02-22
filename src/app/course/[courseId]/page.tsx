import { redirect } from "next/navigation";

import { getSession } from "~/server/session";
import { getCourses, getCourseFiles, getCoursePages } from "~/server/canvas";
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

  const { courseId } = await params;
  const courseIdNum = parseInt(courseId, 10);

  const [courses, files, pages] = await Promise.all([
    getCourses(session.canvasToken),
    getCourseFiles(session.canvasToken, courseIdNum).catch(() => []),
    getCoursePages(session.canvasToken, courseIdNum).catch(() => []),
  ]);

  const course = courses.find((c) => c.id === courseIdNum);

  const friendly = await friendlyCourseNames(
    course ? [{ id: course.id, name: course.name, course_code: course.course_code }] : [],
  );
  const courseName = friendly[courseIdNum]?.full ?? course?.name ?? "Course";

<<<<<<< Updated upstream
  // Filter files to only show readable content types
  const readableFiles = files.filter((f) => {
=======
  const allPages: PageSummary[] = [...pages];
  const seen = new Set(allPages.map((p) => p.url));

  // Tier 1: Extract pages from modules
  if (allPages.length === 0 && modules.length > 0) {
    for (const mod of modules) {
      for (const item of mod.items ?? []) {
        if (item.type === "Page" && item.page_url && !seen.has(item.page_url)) {
          seen.add(item.page_url);
          allPages.push({ page_id: 0, title: item.title, url: item.page_url });
        }
      }
    }
  }

  // Tier 2: Always merge files from modules with Files API results
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
          .slice(0, 50)
          .map((id) => getFile(token, id).catch(() => null)),
      );
      allFiles = [
        ...allFiles,
        ...fetched.filter((f): f is CanvasFile => f !== null),
      ];
    }
  }

  // Collect external file links (PDFs, Google Docs) and Canvas file IDs from all sources
  const externalLinks: { url: string; title: string }[] = [];
  const seenExtUrls = new Set<string>();
  const discoveredFileIds = new Set<number>();

  function collectExtLinks(html: string, baseUrl?: string) {
    for (const link of extractExternalFileLinks(html, baseUrl)) {
      if (!seenExtUrls.has(link.url)) {
        seenExtUrls.add(link.url);
        externalLinks.push(link);
      }
    }
    for (const fid of extractCanvasFileIds(html)) {
      discoveredFileIds.add(fid);
    }
  }

  // Tier 3: Always discover pages from front page, syllabus, and assignments
  if (frontPage?.body) {
    addPages(allPages, seen, extractCanvasPages(frontPage.body, courseIdNum));
    collectExtLinks(frontPage.body);
  }
  if (syllabusBody) {
    addPages(allPages, seen, extractCanvasPages(syllabusBody, courseIdNum));
    collectExtLinks(syllabusBody);
  }
  for (const assignment of assignments) {
    if (assignment.description) {
      addPages(allPages, seen, extractCanvasPages(assignment.description, courseIdNum));
      collectExtLinks(assignment.description);
    }
  }

  // Tier 3b: Fetch embedded HTML pages (e.g., professor's external course sites)
  const htmlSources = [frontPage?.body, syllabusBody].filter(Boolean) as string[];
  const embeddedUrls: string[] = [];
  for (const html of htmlSources) {
    embeddedUrls.push(...extractEmbeddedHtmlUrls(html));
  }
  if (embeddedUrls.length > 0) {
    const embeddedPages = await Promise.all(
      embeddedUrls.slice(0, 5).map(async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          return { url, html: await res.text() };
        } catch {
          return null;
        }
      }),
    );
    for (const ep of embeddedPages) {
      if (!ep) continue;
      const base = ep.url.substring(0, ep.url.lastIndexOf("/") + 1);
      collectExtLinks(ep.html, base);
    }
  }

  // Collect external file links from module ExternalUrl items
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

  // Tier 4: Follow discovered pages to find external files and Canvas file references
  if (allPages.length > 0 && allPages.length <= 100) {
    const firstPassSlugs = allPages.map((p) => p.url);
    const subPages = await Promise.all(
      firstPassSlugs.slice(0, 50).map((slug) =>
        getPage(token, courseIdNum, slug).catch(() => null),
      ),
    );
    for (const page of subPages) {
      if (page?.body) {
        addPages(allPages, seen, extractCanvasPages(page.body, courseIdNum));
        collectExtLinks(page.body);
      }
    }
  }

  // Tier 5: Fetch Canvas files discovered inside page/syllabus/assignment HTML
  const existingFileIds = new Set(allFiles.map((f) => f.id));
  const newFileIds = Array.from(discoveredFileIds).filter((id) => !existingFileIds.has(id));
  if (newFileIds.length > 0) {
    const fetched = await Promise.all(
      newFileIds.slice(0, 100).map((id) => getFile(token, id).catch(() => null)),
    );
    allFiles = [
      ...allFiles,
      ...fetched.filter((f): f is CanvasFile => f !== null),
    ];
  }

  // Filter out external links with useless titles (e.g., "link", "[link]")
  const displayExtLinks = externalLinks.filter((l) => {
    const t = l.title.replace(/[\[\]]/g, "").trim().toLowerCase();
    return t !== "link" && t !== "here" && t !== "";
  });

  // Filter files to only show readable/extractable content types
  const readableFiles = allFiles.filter((f) => {
>>>>>>> Stashed changes
    const ct = f["content-type"];
    return (
      ct === "application/pdf" ||
      ct.startsWith("text/") ||
      ct.includes("html") ||
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

        <h1
          className="mb-8 text-5xl text-[#DCD8FF]"
          style={{ fontFamily: "var(--font-josefin-sans)" }}
        >
          My Courses
        </h1>

        <div>
          <ContentPicker
            courseId={courseIdNum}
            courseCode={courseName}
            files={readableFiles}
            pages={pages}
          />
        </div>
      </main>
    </div>
  );
}
