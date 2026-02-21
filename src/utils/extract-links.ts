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
 * Returns true if the URL points to a directly downloadable file
 * (PDF, text, etc.) based on its path extension.
 */
export function isDirectFileUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return (
      pathname.endsWith(".pdf") ||
      pathname.endsWith(".txt") ||
      pathname.endsWith(".md") ||
      pathname.endsWith(".html") ||
      pathname.endsWith(".htm") ||
      pathname.endsWith(".rtf")
    );
  } catch {
    return false;
  }
}
