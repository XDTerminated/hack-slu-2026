import { NextResponse } from "next/server";
import {
  getCourseFiles,
  getCoursePages,
  getFrontPage,
  getModuleItems,
  getModules,
} from "~/server/canvas";
import { getSession } from "~/server/session";
import {
  extractCanvasFileIds,
  extractEmbeddedHtmlUrls,
  extractExternalFileLinks,
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

  const [files, pages, modules, frontPage] = await Promise.all([
    getCourseFiles(token, cid).catch((e: unknown) => ({ error: String(e) })),
    getCoursePages(token, cid).catch((e: unknown) => ({ error: String(e) })),
    getModules(token, cid).catch((e: unknown) => ({ error: String(e) })),
    getFrontPage(token, cid).catch((e: unknown) => ({ error: String(e) })),
  ]);

  debug.files = Array.isArray(files)
    ? {
        count: files.length,
        items: files.map((f) => ({
          id: f.id,
          name: f.display_name,
          type: f["content-type"],
          size: f.size,
        })),
      }
    : files;

  debug.pages = Array.isArray(pages)
    ? {
        count: pages.length,
        items: pages.map((p) => ({ title: p.title, url: p.url })),
      }
    : pages;

  debug.modules = Array.isArray(modules) ? { count: modules.length } : modules;

  if (frontPage && !("error" in frontPage)) {
    const embeddedUrls = frontPage.body
      ? extractEmbeddedHtmlUrls(frontPage.body)
      : [];
    debug.frontPage = {
      title: frontPage.title,
      bodyLength: frontPage.body?.length ?? 0,
      embeddedUrls,
      canvasFileIds: frontPage.body ? extractCanvasFileIds(frontPage.body) : [],
      externalFileLinks: frontPage.body
        ? extractExternalFileLinks(frontPage.body)
        : [],
    };
  } else {
    debug.frontPage = frontPage;
  }

  // Module details — the key debug info
  if (Array.isArray(modules)) {
    const moduleDetails = [];
    for (const mod of modules) {
      const inlineCount = mod.items?.length ?? 0;
      const truncated = mod.items_count > inlineCount;

      let allItems = mod.items ?? [];
      if (truncated) {
        allItems = await getModuleItems(token, cid, mod.id).catch(() => []);
      }

      const fileItems = allItems.filter((i) => i.type === "File");
      const pageItems = allItems.filter((i) => i.type === "Page");
      const extUrlItems = allItems.filter((i) => i.type === "ExternalUrl");

      moduleDetails.push({
        id: mod.id,
        name: mod.name,
        items_count: mod.items_count,
        inline_items: inlineCount,
        truncated,
        total_fetched: allItems.length,
        files: fileItems.map((i) => ({
          title: i.title,
          content_id: i.content_id,
          type: i.type,
        })),
        pages: pageItems.map((i) => ({
          title: i.title,
          page_url: i.page_url,
        })),
        externalUrls: extUrlItems.map((i) => ({
          title: i.title,
          url: i.external_url,
        })),
      });
    }
    debug.modules = { count: modules.length, details: moduleDetails };
  } else {
    debug.modules = modules;
  }

  return NextResponse.json(debug, {
    headers: { "Content-Type": "application/json" },
  });
}
