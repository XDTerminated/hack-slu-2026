import { Sidebar } from "~/components/nav/sidebar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="pl-28 pr-10 pt-8 pb-16">
        {/* Logo */}
        <div className="mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cognify-logo-purple.svg"
            alt="Cognify"
            style={{ width: "200px", height: "auto", maxWidth: "none" }}
          />
        </div>

        {/* Centered spinner */}
        <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
          <div className="text-center">
            <svg
              className="mx-auto h-20 w-20 animate-spin text-[#B8B0E0]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.14 12.94a7.07 7.07 0 0 0 .06-.94 7.07 7.07 0 0 0-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.04 7.04 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54a7.04 7.04 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58a7.07 7.07 0 0 0-.06.94c0 .32.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54a7.04 7.04 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
            </svg>
            <p
              className="mt-6 text-xl text-[#B8B0E0]"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Loading...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
