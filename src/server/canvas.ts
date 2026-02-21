const CANVAS_BASE_URL = "https://umsystem.instructure.com";

async function canvasFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${CANVAS_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Canvas API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Types ---

export type Course = {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id: number;
};

export type Module = {
  id: number;
  name: string;
  position: number;
  items_count: number;
  items?: ModuleItem[];
};

export type ModuleItem = {
  id: number;
  title: string;
  type:
    | "File"
    | "Page"
    | "Discussion"
    | "Assignment"
    | "Quiz"
    | "SubHeader"
    | "ExternalUrl"
    | "ExternalTool";
  content_id?: number;
  page_url?: string;
  url?: string;
  external_url?: string;
};

export type Page = {
  page_id: number;
  title: string;
  body: string;
  url: string;
};

export type PageSummary = {
  page_id: number;
  title: string;
  url: string;
};

export type CanvasFile = {
  id: number;
  display_name: string;
  filename: string;
  url: string;
  size: number;
  "content-type": string;
};

export type Assignment = {
  id: number;
  name: string;
  description: string | null;
};

// --- API Functions ---

export async function getCourses(token: string): Promise<Course[]> {
  return canvasFetch<Course[]>(
    token,
    "/api/v1/courses?enrollment_type=student&enrollment_state=active&per_page=50",
  );
}

export async function getModules(
  token: string,
  courseId: number,
): Promise<Module[]> {
  return canvasFetch<Module[]>(
    token,
    `/api/v1/courses/${courseId}/modules?include[]=items&per_page=50`,
  );
}

export async function getModuleItems(
  token: string,
  courseId: number,
  moduleId: number,
): Promise<ModuleItem[]> {
  return canvasFetch<ModuleItem[]>(
    token,
    `/api/v1/courses/${courseId}/modules/${moduleId}/items?per_page=50`,
  );
}

export async function getPage(
  token: string,
  courseId: number,
  pageUrl: string,
): Promise<Page> {
  return canvasFetch<Page>(
    token,
    `/api/v1/courses/${courseId}/pages/${pageUrl}`,
  );
}

export async function getFile(
  token: string,
  fileId: number,
): Promise<CanvasFile> {
  return canvasFetch<CanvasFile>(token, `/api/v1/files/${fileId}`);
}

export async function downloadFile(
  token: string,
  fileUrl: string,
): Promise<Buffer> {
  const res = await fetch(fileUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`File download error: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function getAssignment(
  token: string,
  courseId: number,
  assignmentId: number,
): Promise<Assignment> {
  return canvasFetch<Assignment>(
    token,
    `/api/v1/courses/${courseId}/assignments/${assignmentId}`,
  );
}

export async function getCourseFiles(
  token: string,
  courseId: number,
): Promise<CanvasFile[]> {
  return canvasFetch<CanvasFile[]>(
    token,
    `/api/v1/courses/${courseId}/files?per_page=100&sort=name&order=asc`,
  );
}

export async function getCoursePages(
  token: string,
  courseId: number,
): Promise<PageSummary[]> {
  return canvasFetch<PageSummary[]>(
    token,
    `/api/v1/courses/${courseId}/pages?per_page=100&sort=title&order=asc`,
  );
}
