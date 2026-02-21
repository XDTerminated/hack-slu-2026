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
};

export type Page = {
  title: string;
  body: string;
  url: string;
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
