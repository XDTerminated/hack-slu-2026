type UploadEntry = { name: string; text: string };

const globalStore = globalThis as unknown as {
  __uploadStore?: Map<string, UploadEntry>;
};

function getStore(): Map<string, UploadEntry> {
  globalStore.__uploadStore ??= new Map();
  return globalStore.__uploadStore;
}

export function saveUpload(id: string, name: string, text: string) {
  getStore().set(id, { name, text });
  // Auto-expire after 30 minutes
  setTimeout(() => getStore().delete(id), 30 * 60 * 1000);
}

export function getUpload(id: string): UploadEntry | undefined {
  return getStore().get(id);
}

export function getUploads(ids: string[]): string {
  return ids
    .map((id) => {
      const entry = getStore().get(id);
      return entry ? `## ${entry.name}\n\n${entry.text}` : "";
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}
