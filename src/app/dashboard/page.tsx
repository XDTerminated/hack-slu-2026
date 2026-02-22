import Image from "next/image";
import { redirect } from "next/navigation";
import { DashboardContent } from "~/components/dashboard/dashboard-content";
import { Sidebar } from "~/components/nav/sidebar";
import { getSelf } from "~/server/canvas";
import { getSession } from "~/server/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  // Lazily populate canvasUserId if missing (for sessions created before this field existed)
  if (!session.canvasUserId) {
    try {
      const self = await getSelf(session.canvasToken);
      session.canvasUserId = self.id;
      await session.save();
    } catch {
      // If we can't get user ID, continue without it
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="pt-8 pr-10 pb-16 pl-28">
        {/* Header */}
        <div className="mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src="/cognify-logo-purple.svg"
            alt="Cognify"
            style={{ width: "200px", height: "auto", maxWidth: "none" }}
          />
        </div>

        <DashboardContent />
      </main>
    </div>
  );
}
