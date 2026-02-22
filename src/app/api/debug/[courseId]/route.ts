import { NextResponse } from "next/server";
import { getSession } from "~/server/session";
import {
  getCourseFiles,
  getCoursePages,
  getModules,
  getFrontPage,
  getCourseSyllabus,
  getCourseAssignments,
} from "~/server/canvas";
import {
  extractCanvasPages,
  extractExternalFileLinks,
  extractCanvasFileIds,
  extractEmbeddedHtmlUrls,
  extractLinks,
} from "~/utils/extract-links";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const session = await getSession();
  if (!session.canvasToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const token = session.canvasToken;
  const { courseId } = await params;
  const cid = parseInt(courseId, 10);

  const debug: Record<string, unknown> = {};

  const [files, pages, modules, syllabusBody, assignments, frontPage] =
    await Promise.all([
      getCourseFiles(token, cid).catch((e: unknown) => ({ error: String(e) })),
      getCoursePages(token, cid).catch((e: unknown) => ({ error: String(e) })),
      getModules(token, cid).catch((e: unknown) => ({ error: String(e) })),
      getCourseSyllabus(token, cid).catch((e: unknown) => ({ error: String(e) })),
      getCourseAssignments(token, cid).catch((e: unknown) => ({ error: String(e) })),
      getFrontPage(token, cid).catch((e: unknown) => ({ error: String(e) })),
    ]);

  debug.files = Array.isArray(files)
    ? { count: files.length, items: files.map((f) => ({ id: f.id, name: f.display_name, type: f["content-type"], size: f.size })) }
    : files;

  debug.pages = Array.isArray(pages)
    ? { count: pages.length, items: pages.map((p) => ({ title: p.title, url: p.url })) }
    : pages;

  debug.modules = Array.isArray(modules)
    ? { count: modules.length }
    : modules;

  if (frontPage && !("error" in frontPage)) {
    const embeddedUrls = frontPage.body ? extractEmbeddedHtmlUrls(frontPage.body) : [];
    debug.frontPage = {
      title: frontPage.title,
      bodyLength: frontPage.body?.length ?? 0,
      embeddedUrls,
      canvasFileIds: frontPage.body ? extractCanvasFileIds(frontPage.body) : [],
      externalFileLinks: frontPage.body ? extractExternalFileLinks(frontPage.body) : [],
    };

    // Fetch embedded pages and show raw HTML + extracted links
    if (embeddedUrls.length > 0) {
      const embeddedResults = [];
      for (const url of embeddedUrls.slice(0, 3)) {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            embeddedResults.push({ url, error: `HTTP ${res.status}` });
            continue;
          }
          const html = await res.text();
          const base = url.substring(0, url.lastIndexOf("/") + 1);
          embeddedResults.push({
            url,
            htmlLength: html.length,
            htmlSnippet: html.slice(0, 5000),
            extractedWithBase: extractExternalFileLinks(html, base),
            extractedWithoutBase: extractExternalFileLinks(html),
            allLinks: extractLinks(html),
          });
        } catch (e: unknown) {
          embeddedResults.push({ url, error: String(e) });
        }
      }
      debug.embeddedPages = embeddedResults;
    }
  } else {
    debug.frontPage = frontPage;
  }

  return NextResponse.json(debug, {
    headers: { "Content-Type": "application/json" },
  });
}
