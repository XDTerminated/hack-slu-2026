/**
 * Extracts all href URLs from anchor tags in HTML.
 */
export function extractLinks(html: string): string[] {
  const links: string[] = [];
  const regex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      links.push(url);
    }
  }
  return links;
}

const DRIVE_FILE_RE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_OPEN_RE = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
const DOCS_DOC_RE = /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/;
const DOCS_SLIDE_RE = /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/;

/**
 * Converts a Google Drive view/share URL to a direct download URL.
 * Returns null if it's not a recognized Google Drive link.
 */
export function getGoogleDriveDownloadUrl(url: string): string | null {
  const fileMatch = DRIVE_FILE_RE.exec(url);
  if (fileMatch?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }

  const openMatch = DRIVE_OPEN_RE.exec(url);
  if (openMatch?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }

  const docMatch = DOCS_DOC_RE.exec(url);
  if (docMatch?.[1]) {
    return `https://docs.google.com/document/d/${docMatch[1]}/export?format=txt`;
  }

  const slideMatch = DOCS_SLIDE_RE.exec(url);
  if (slideMatch?.[1]) {
    return `https://docs.google.com/presentation/d/${slideMatch[1]}/export?format=txt`;
  }

  return null;
}

/**
 * Extracts Canvas page slugs from HTML links for a specific course.
 * Finds both relative (/courses/ID/pages/SLUG) and absolute URLs.
 */
export function extractCanvasPageSlugs(
  html: string,
  courseId: number,
): string[] {
  const slugs: string[] = [];
  const seen = new Set<string>();
  const hrefRe = /href=["']([^"']+)["']/gi;
  const pageRe = new RegExp(`/courses/${courseId}/pages/([^"'#?\\s/]+)`);

  let match;
  while ((match = hrefRe.exec(html)) !== null) {
    const href = match[1];
    if (!href) continue;
    const pageMatch = pageRe.exec(href);
    if (pageMatch?.[1]) {
      const slug = decodeURIComponent(pageMatch[1]);
      if (!seen.has(slug)) {
        seen.add(slug);
        slugs.push(slug);
      }
    }
  }
  return slugs;
}

/**
 * Extracts Canvas page links with their visible anchor text from HTML.
 * Prefers the title attribute over inner text when available.
 * Returns slug + title pairs for use in the content picker.
 */
export function extractCanvasPages(
  html: string,
  courseId: number,
): { slug: string; title: string }[] {
  const results: { slug: string; title: string }[] = [];
  const seen = new Set<string>();
  const tagPattern = /<a\s([^>]*?)>([\s\S]*?)<\/a>/gi;
  const pageRe = new RegExp(`/courses/${courseId}/pages/([^"'#?\\s/]+)`);

  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    const attrs = match[1]!;
    const innerHtml = match[2]!;
    const hrefMatch = /href=["']([^"']+)["']/i.exec(attrs);
    if (!hrefMatch?.[1]) continue;

    const pageMatch = pageRe.exec(hrefMatch[1]);
    if (!pageMatch?.[1]) continue;

    const slug = decodeURIComponent(pageMatch[1].replace(/\/$/, ""));
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    const titleAttr = /title=["']([^"']+)["']/i.exec(attrs);
    const innerText = innerHtml.replace(/<[^>]+>/g, "").trim();
    const title =
      titleAttr?.[1] ?? (innerText ? innerText : slug.replace(/-/g, " "));

    results.push({ slug, title });
  }
  return results;
}

/**
 * Extracts Canvas file IDs from HTML content.
 * Matches /files/:id patterns in Canvas URLs (links, embeds, etc.).
 */
export function extractCanvasFileIds(html: string): number[] {
  const ids = new Set<number>();
  const pattern = /\/files\/(\d+)/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const id = parseInt(match[1]!, 10);
    if (!isNaN(id)) ids.add(id);
  }
  return Array.from(ids);
}

/**
 * Returns true if the URL points to a directly downloadable file
 * (PDF, text, etc.) based on its path extension.
 */
export function isDirectFileUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return (
      pathname.endsWith(".pdf") ||
      pathname.endsWith(".pptx") ||
      pathname.endsWith(".ppt") ||
      pathname.endsWith(".docx") ||
      pathname.endsWith(".doc") ||
      pathname.endsWith(".xlsx") ||
      pathname.endsWith(".xls") ||
      pathname.endsWith(".txt") ||
      pathname.endsWith(".md") ||
      pathname.endsWith(".rtf")
    );
  } catch {
    return false;
  }
}

/**
 * Extracts src URLs from <embed> and <iframe> tags pointing to HTML content.
 * Used to discover professor course pages embedded in Canvas.
 */
export function extractEmbeddedHtmlUrls(html: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const pattern = /<(?:embed|iframe)\s[^>]*?src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    let url = match[1]!;
    if (url.startsWith("//")) url = "https:" + url;
    if (!url.startsWith("http")) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

/**
 * Extracts external file links (PDFs, Google Docs, etc.) from HTML.
 * When baseUrl is provided, resolves relative URLs against it.
 * Returns url + title pairs for the content picker.
 */
export function extractExternalFileLinks(
  html: string,
  baseUrl?: string,
): { url: string; title: string }[] {
  // Fix malformed HTML where <a> (no attributes) is used instead of </a>
  const fixedHtml = html.replace(/<a\s*>/gi, "</a>");

  const results: { url: string; title: string }[] = [];
  const seen = new Set<string>();
  const tagPattern = /<a\s([^>]*?)>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = tagPattern.exec(fixedHtml)) !== null) {
    const attrs = match[1]!;
    const innerHtml = match[2]!;
    const hrefMatch = /href=["']([^"']+)["']/i.exec(attrs);
    if (!hrefMatch?.[1]) continue;

    let url = hrefMatch[1];
    // Resolve relative URLs when a base URL is provided
    if (baseUrl && !url.startsWith("http") && !url.startsWith("//") && !url.startsWith("#") && !url.startsWith("mailto:")) {
      try { url = new URL(url, baseUrl).href; } catch { continue; }
    } else if (url.startsWith("//")) {
      url = "https:" + url;
    }
    if (!url.startsWith("http")) continue;
    if (seen.has(url)) continue;

    // Only include downloadable files and Google Docs
    if (!isDirectFileUrl(url) && !getGoogleDriveDownloadUrl(url)) continue;

    seen.add(url);
    const innerText = innerHtml.replace(/<[^>]+>/g, "").trim();
    const titleAttr = /title=["']([^"']+)["']/i.exec(attrs);
    const title =
      titleAttr?.[1] ?? (innerText ? innerText : urlToLabel(url));

    results.push({ url, title });
  }
  return results;
}

function urlToLabel(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && last !== "view" && last !== "edit") {
      return decodeURIComponent(last).replace(/[_-]/g, " ").replace(/\.\w+$/, "");
    }
    return "External File";
  } catch {
    return "External File";
  }
}
