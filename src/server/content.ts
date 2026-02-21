import { getModuleItems, getPage } from "./canvas";
import { htmlToText } from "~/utils/html-to-text";

export async function fetchModuleContent(
  token: string,
  courseId: number,
  moduleIds: number[],
): Promise<string> {
  const allText: string[] = [];

  for (const moduleId of moduleIds) {
    const items = await getModuleItems(token, courseId, moduleId);
    const pageItems = items.filter(
      (item) => item.type === "Page" && item.page_url,
    );

    const pageTexts = await Promise.all(
      pageItems.map(async (item) => {
        try {
          const page = await getPage(token, courseId, item.page_url!);
          return `## ${page.title}\n\n${htmlToText(page.body)}`;
        } catch {
          return "";
        }
      }),
    );

    allText.push(...pageTexts.filter(Boolean));
  }

  return allText.join("\n\n---\n\n");
}
