"use client";

import { useEffect, useState } from "react";
import { Spinner } from "~/components/ui/spinner";
import { getUserSettings, setAnonymous } from "~/server/stats";

export function SettingsContent() {
  const [name, setName] = useState("");
  const [anonymous, setAnonymousState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserSettings()
      .then((s) => {
        if (s) {
          setName(s.name);
          setAnonymousState(s.anonymous);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleToggle() {
    const next = !anonymous;
    setSaving(true);
    const result = await setAnonymous(next);
    setSaving(false);
    if (result.ok) {
      setAnonymousState(next);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-lg rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <h2
        className="mb-1 text-xl font-bold text-[#7E6FAE]"
        style={{ fontFamily: "var(--font-josefin-sans)" }}
      >
        Leaderboard Privacy
      </h2>
      <p
        className="mb-6 text-sm text-gray-400"
        style={{ fontFamily: "var(--font-average-sans)" }}
      >
        Choose whether other students can see your name on the leaderboard.
      </p>

      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FAFAFA] px-5 py-4">
        <div>
          <p
            className="text-base font-medium text-gray-700"
            style={{ fontFamily: "var(--font-josefin-sans)" }}
          >
            {anonymous ? "You appear as Anonymous" : `Visible as ${name}`}
          </p>
          <p
            className="mt-0.5 text-xs text-gray-400"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            {anonymous
              ? "Other students cannot see your name"
              : "Your Canvas name is shown on leaderboards"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
            anonymous ? "bg-[#7E6FAE]" : "bg-gray-300"
          } ${saving ? "opacity-50" : "cursor-pointer"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
              anonymous ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
