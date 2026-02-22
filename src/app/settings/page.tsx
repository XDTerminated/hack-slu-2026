import { redirect } from "next/navigation";
import { Sidebar } from "~/components/nav/sidebar";
import { SettingsContent } from "~/components/settings/settings-content";
import { getSession } from "~/server/session";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="pt-8 pr-10 pb-16 pl-28">
        <h1
          className="mb-8 text-5xl font-bold text-[#7E6FAE]"
          style={{ fontFamily: "var(--font-average-sans)" }}
        >
          Settings
        </h1>

        <SettingsContent />
      </main>
    </div>
  );
}
