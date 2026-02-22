import { redirect } from "next/navigation";
import { getSession } from "~/server/session";
import { Sidebar } from "~/components/nav/sidebar";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.canvasToken) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      {/* Main content */}
      <main className="pt-8 pr-10 pb-16 pl-28">
        {/* Header */}
        <div className="mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cognify-logo-purple.svg"
            alt="Cognify"
            style={{ width: "200px", height: "auto", maxWidth: "none" }}
          />
        </div>

        {/* Title row */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p
              className="text-lg text-[#DCD8FF]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Today&apos;s
            </p>
            <h1
              className="text-5xl text-[#DCD8FF]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Dashboard
            </h1>
          </div>

          {/* Time range pills */}
          <div className="flex gap-3">
            <button className="rounded-full bg-[#DCD8FF] px-6 py-2 text-sm font-medium text-white" style={{ fontFamily: "var(--font-josefin-sans)" }}>
              Today
            </button>
            <button className="rounded-full border-2 border-[#DCD8FF] px-6 py-2 text-sm font-medium text-[#DCD8FF]" style={{ fontFamily: "var(--font-josefin-sans)" }}>
              Week
            </button>
            <button className="rounded-full border-2 border-[#DCD8FF] px-6 py-2 text-sm font-medium text-[#DCD8FF]" style={{ fontFamily: "var(--font-josefin-sans)" }}>
              Month
            </button>
          </div>
        </div>

        {/* Stats bento grid */}
        <div className="grid grid-cols-12 grid-rows-[200px_200px] gap-6">
          {/* Row 1, left — empty placeholder (wide) */}
          <div className="col-span-5 flex items-center justify-center rounded-3xl bg-white shadow-sm" />

          {/* Row 1, middle — Study Time (small square) */}
          <div className="col-span-3 flex items-center justify-center rounded-3xl bg-white shadow-sm">
            <div className="flex gap-2">
              <span
                className="text-8xl font-bold text-[#797979]"
                style={{
                  fontFamily: "var(--font-average-sans)",
                }}
              >
                0
              </span>
              <div className="flex flex-col items-center justify-center pt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/time.svg"
                  alt="Clock"
                  style={{ width: "36px", height: "36px", maxWidth: "none" }}
                />
                <span
                  className="text-xl text-[#797979]"
                  style={{ fontFamily: "var(--font-average-sans)" }}
                >
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* Row 1+2, right — tall card spanning 2 rows */}
          <div className="col-span-4 row-span-2 flex items-center justify-center rounded-3xl bg-white shadow-sm" />

          {/* Row 2, left — Day Streak (small square) */}
          <div className="col-span-3 flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/streak.svg"
                alt="Streak"
                style={{ width: "80px", height: "auto", maxWidth: "none" }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-[#FFAB44]"
                style={{
                  fontFamily: "var(--font-average-sans)",
                  paddingTop: "16px",
                  WebkitTextStroke: "3px #FFAB44",
                }}
              >
                0
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white"
                style={{
                  fontFamily: "var(--font-average-sans)",
                  paddingTop: "16px",
                }}
              >
                0
              </span>
            </div>
            <span
              className="text-2xl font-semibold text-[#FFAB44]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Day Streak
            </span>
          </div>

          {/* Row 2, middle — empty placeholder (wide) */}
          <div className="col-span-5 flex items-center justify-center rounded-3xl bg-white shadow-sm" />
        </div>
      </main>
    </div>
  );
}
