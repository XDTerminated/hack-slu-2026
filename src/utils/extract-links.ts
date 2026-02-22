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
 * Extracts Canvas page slugs from HTML that link to pages in the given course.
 * Matches both absolute URLs and relative /courses/:id/pages/:slug paths.
 */
export function extractCanvasPageSlugs(
  html: string,
  courseId: number,
): { slug: string; title: string }[] {
  const results: { slug: string; title: string }[] = [];
  const seen = new Set<string>();

  // Match href links to course pages (absolute and relative)
  const patterns = [
    // Absolute: https://...instructure.com/courses/356315/pages/slug
    new RegExp(
      `href=["'](?:https?://[^/]+)?/courses/${courseId}/pages/([^"'#?]+)["']`,
      "gi",
    ),
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const slug = decodeURIComponent(match[1]!);
      if (!seen.has(slug)) {
        seen.add(slug);
        // Convert slug to readable title: "2500-algorithms-sp26" -> "2500 Algorithms Sp26"
        const title = slug
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        results.push({ slug, title });
      }
    }
  }

  return results;
}

/**
 * Returns true if the URL points to a directly downloadable file
 * based on its path extension.
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
      pathname.endsWith(".html") ||
      pathname.endsWith(".htm") ||
      pathname.endsWith(".rtf") ||
      pathname.endsWith(".pptx") ||
      pathname.endsWith(".ppt") ||
      pathname.endsWith(".docx") ||
      pathname.endsWith(".doc") ||
      pathname.endsWith(".xlsx") ||
      pathname.endsWith(".xls")
    );
  } catch {
    return false;
  }
}

/**
 * Extracts Canvas internal file IDs from HTML links.
 * Matches URLs like /courses/{courseId}/files/{fileId}/download or /files/{fileId}/download.
 */
export function extractCanvasFileIds(html: string): number[] {
  const ids: number[] = [];
  const seen = new Set<number>();
  const regex = /\/files\/(\d+)(?:\/download)?/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const id = parseInt(match[1]!, 10);
    if (!isNaN(id) && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}
