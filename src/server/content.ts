// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse") as (
  buffer: Buffer,
) => Promise<{ text: string }>;
import { parseOffice } from "officeparser";
import { getFile, downloadFile, getPage, getAssignment } from "./canvas";
import { htmlToText } from "~/utils/html-to-text";
import {
  extractLinks,
  getGoogleDriveDownloadUrl,
  isDirectFileUrl,
} from "~/utils/extract-links";

export async function fetchSelectedContent(
  token: string,
  courseId: number,
  fileIds: number[],
  pageUrls: string[],
  assignmentIds: number[] = [],
  linkUrls: string[] = [],
): Promise<string> {
  const results = await Promise.all([
    ...fileIds.map((id) => extractFileById(token, id)),
    ...pageUrls.map((url) => extractPageWithLinks(token, courseId, url)),
    ...assignmentIds.map((id) =>
      extractAssignmentWithLinks(token, courseId, id),
    ),
    ...linkUrls.map((url) => extractFromExternalLink(url)),
  ]);

  return results
    .flat()
    .filter(Boolean)
    .join("\n\n---\n\n");
}

// --- Canvas file extraction ---

async function extractFileById(
  token: string,
  fileId: number,
): Promise<string> {
  try {
    const file = await getFile(token, fileId);
    return await extractFromContentType(
      file.display_name,
      file["content-type"],
      () => downloadFile(token, file.url),
    );
  } catch {
    return "";
  }
}

// --- Page extraction + follow embedded links ---

async function extractPageWithLinks(
  token: string,
  courseId: number,
  pageUrl: string,
): Promise<string[]> {
  try {
    const page = await getPage(token, courseId, pageUrl);
    if (!page.body) return [];

    const pageText = `## ${page.title}\n\n${htmlToText(page.body)}`;

    // Find all external links and fetch their content
    const links = extractLinks(page.body);
    const linkTexts = await Promise.all(
      links.map((link) => extractFromExternalLink(link)),
    );

    return [pageText, ...linkTexts.filter(Boolean)];
  } catch {
    return [];
  }
}

// --- Assignment extraction + follow embedded links ---

async function extractAssignmentWithLinks(
  token: string,
  courseId: number,
  assignmentId: number,
): Promise<string[]> {
  try {
    const assignment = await getAssignment(token, courseId, assignmentId);
    if (!assignment.description) return [];

    const text = htmlToText(assignment.description);
    const assignmentText = `## ${assignment.name}\n\n${text}`;

    const links = extractLinks(assignment.description);
    const linkTexts = await Promise.all(
      links.map((link) => extractFromExternalLink(link)),
    );

    return [assignmentText, ...linkTexts.filter(Boolean)];
  } catch {
    return [];
  }
}

// --- External link extraction (Google Drive, direct files) ---

async function extractFromExternalLink(url: string): Promise<string> {
  try {
    const gdriveUrl = getGoogleDriveDownloadUrl(url);
    if (gdriveUrl) {
      return await fetchAndExtract(gdriveUrl, url);
    }

    if (isDirectFileUrl(url)) {
      return await fetchAndExtract(url, url);
    }

    return "";
  } catch {
    return "";
  }
}

async function fetchAndExtract(
  downloadUrl: string,
  originalUrl: string,
): Promise<string> {
  try {
    const res = await fetch(downloadUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return "";

    const contentType = res.headers.get("content-type") ?? "";
    const buffer = Buffer.from(await res.arrayBuffer());
    const label = labelFromUrl(originalUrl);

    if (contentType.includes("pdf") || downloadUrl.endsWith(".pdf")) {
      const pdf = await pdfParse(buffer);
      return pdf.text ? `## ${label}\n\n${pdf.text}` : "";
    }

    // Office documents (pptx, docx, xlsx, etc.)
    const isOffice =
      contentType.includes("presentation") ||
      contentType.includes("powerpoint") ||
      contentType.includes("wordprocessing") ||
      contentType.includes("msword") ||
      contentType.includes("spreadsheet") ||
      contentType.includes("excel") ||
      /\.(pptx?|docx?|xlsx?)$/i.test(downloadUrl);
    if (isOffice) {
      const ast = await parseOffice(buffer);
      const text = ast.toText();
      return text ? `## ${label}\n\n${text}` : "";
    }

    if (contentType.includes("html")) {
      const text = htmlToText(buffer.toString("utf-8"));
      return text ? `## ${label}\n\n${text}` : "";
    }

    if (
      contentType.startsWith("text/") ||
      contentType.includes("json") ||
      contentType.includes("rtf")
    ) {
      const text = buffer.toString("utf-8");
      return text ? `## ${label}\n\n${text}` : "";
    }

    return "";
  } catch {
    return "";
  }
}

// --- Helpers ---

async function extractFromContentType(
  name: string,
  contentType: string,
  download: () => Promise<Buffer>,
): Promise<string> {
  if (contentType === "application/pdf") {
    const buffer = await download();
    const pdf = await pdfParse(buffer);
    return `## ${name}\n\n${pdf.text}`;
  }

  // Office documents (pptx, docx, xlsx, etc.)
  if (
    contentType.includes("presentation") ||
    contentType.includes("powerpoint") ||
    contentType.includes("wordprocessing") ||
    contentType.includes("msword") ||
    contentType.includes("spreadsheet") ||
    contentType.includes("excel")
  ) {
    const buffer = await download();
    const ast = await parseOffice(buffer);
    const text = ast.toText();
    return text ? `## ${name}\n\n${text}` : "";
  }

  if (
    contentType.startsWith("text/") ||
    contentType === "application/json" ||
    contentType === "application/rtf"
  ) {
    const buffer = await download();
    return `## ${name}\n\n${buffer.toString("utf-8")}`;
  }

  if (contentType.includes("html")) {
    const buffer = await download();
    return `## ${name}\n\n${htmlToText(buffer.toString("utf-8"))}`;
  }

  return "";
}

function labelFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && last !== "view" && last !== "edit") {
      return decodeURIComponent(last).replace(/[_-]/g, " ");
    }
    return segments[segments.length - 2] ?? "Linked File";
  } catch {
    return "Linked File";
  }
}
