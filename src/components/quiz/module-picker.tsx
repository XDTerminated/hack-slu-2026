"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import type { Module } from "~/server/canvas";

type Props = {
  courseId: number;
  modules: Module[];
};

export function ModulePicker({ courseId, modules }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggle(moduleId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(modules.map((m) => m.id)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function startStudying() {
    if (selected.size === 0) return;
    const ids = Array.from(selected).join(",");
    router.push(`/course/${courseId}/study?modules=${ids}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3">
        <Button variant="ghost" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="ghost" onClick={deselectAll}>
          Deselect All
        </Button>
      </div>

      <div className="space-y-2">
        {modules.map((mod) => (
          <label
            key={mod.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300"
          >
            <input
              type="checkbox"
              checked={selected.has(mod.id)}
              onChange={() => toggle(mod.id)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600"
            />
            <div>
              <span className="font-medium text-gray-900">{mod.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({mod.items_count} items)
              </span>
            </div>
          </label>
        ))}
      </div>

      {modules.length === 0 && (
        <p className="py-8 text-center text-gray-500">
          No modules found for this course.
        </p>
      )}

      <Button
        onClick={startStudying}
        disabled={selected.size === 0}
        className="mt-6 w-full py-3 text-lg"
      >
        Start Studying ({selected.size} module{selected.size !== 1 ? "s" : ""})
      </Button>
    </div>
  );
}
