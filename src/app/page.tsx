<<<<<<< Updated upstream
=======
import Image from "next/image";
>>>>>>> Stashed changes
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "~/server/session";

export default async function HomePage() {
  const session = await getSession();
  if (session.canvasToken) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Lavender header + wave ── */}
      <div className="relative">
<<<<<<< Updated upstream
        <div className="bg-[#D1C4E9]">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-10 py-6">
            {/* Logo */}
            <div className="flex items-end gap-0.5">
              <span
                className="text-3xl tracking-tight text-[#7E6FAE]"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                Cognify
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                className="-ml-1 mb-1"
              >
                <path
                  d="M9 0l2.2 6.8L18 9l-6.8 2.2L9 18l-2.2-6.8L0 9l6.8-2.2z"
                  fill="#A09850"
                />
              </svg>
            </div>
=======
        <div className="bg-[#DCD8FF]">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-10 py-6">
            {/* Logo */}
            <Image
              src="/cognify-logo.svg"
              alt="Cognify"
              width={189}
              height={69}
              className="h-10 w-auto"
              priority
            />
>>>>>>> Stashed changes

            {/* Login button */}
            <Link
              href="/login"
<<<<<<< Updated upstream
              className="flex items-center gap-2.5 rounded-full bg-white/90 px-6 py-2.5 shadow-sm transition hover:shadow-md"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="3.5" r="2" fill="#C04040" />
                <circle cx="17.5" cy="7.5" r="2" fill="#C04040" />
                <circle cx="17.5" cy="14.5" r="2" fill="#C04040" />
                <circle cx="11" cy="18.5" r="2" fill="#C04040" />
                <circle cx="4.5" cy="14.5" r="2" fill="#C04040" />
                <circle cx="4.5" cy="7.5" r="2" fill="#C04040" />
                <line x1="11" y1="3.5" x2="17.5" y2="7.5" stroke="#C04040" strokeWidth="1" />
                <line x1="17.5" y1="7.5" x2="17.5" y2="14.5" stroke="#C04040" strokeWidth="1" />
                <line x1="17.5" y1="14.5" x2="11" y2="18.5" stroke="#C04040" strokeWidth="1" />
                <line x1="11" y1="18.5" x2="4.5" y2="14.5" stroke="#C04040" strokeWidth="1" />
                <line x1="4.5" y1="14.5" x2="4.5" y2="7.5" stroke="#C04040" strokeWidth="1" />
                <line x1="4.5" y1="7.5" x2="11" y2="3.5" stroke="#C04040" strokeWidth="1" />
              </svg>
              <span className="text-base font-medium text-gray-800">Login</span>
=======
              className="flex items-center gap-2.5 rounded-full bg-white/90 pl-3 pr-6 py-2.5 shadow-sm transition hover:shadow-md"
            >
              <Image
                src="/canvas-logo.svg"
                alt="Canvas"
                width={140}
                height={46}
                className="h-8 w-auto"
              />
              <span
                className="text-2xl font-medium text-[#DCD8FF]"
                style={{ fontFamily: "var(--font-josefin-sans)" }}
              >Login</span>
>>>>>>> Stashed changes
            </Link>
          </nav>
        </div>

        {/* Wave separator */}
        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="block w-full"
        >
          <path
<<<<<<< Updated upstream
            fill="#D1C4E9"
            d="M0,0 H1440 V60 C1200,160 800,100 480,140 C240,170 80,100 0,120 Z"
=======
            fill="#DCD8FF"
            d="M0,0 H1440 V120 Q1080,0 720,90 Q360,180 0,60 Z"
>>>>>>> Stashed changes
          />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div className="-mt-4 flex flex-col items-center px-8 pb-32 text-center">
        <h1
<<<<<<< Updated upstream
          className="max-w-5xl text-7xl leading-tight text-[#C8BDE3]"
          style={{ fontFamily: "var(--font-dm-serif)" }}
=======
          className="max-w-5xl text-7xl font-bold leading-tight whitespace-nowrap text-[#DCD8FF]"
          style={{ fontFamily: "var(--font-maitree)" }}
>>>>>>> Stashed changes
        >
          Learning That Adapts to You
        </h1>

<<<<<<< Updated upstream
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#9A94B0]">
=======
        <p className="mt-3 max-w-lg text-2xl leading-relaxed text-[#DCD8FF]">
>>>>>>> Stashed changes
          Real-time cognitive insights personalize
          your lessons, adjust difficulty, and bridge
          learning gaps as you study.
        </p>

        <Link
          href="/login"
<<<<<<< Updated upstream
          className="mt-12 rounded-full bg-[#D1C4E9] px-14 py-5 text-xl font-semibold text-[#5C5080] shadow-lg transition hover:shadow-xl"
          style={{ fontFamily: "var(--font-dm-serif)" }}
=======
          className="mt-8 rounded-full bg-[#DCD8FF] px-10 py-3.5 text-xl font-semibold text-white shadow-lg transition hover:shadow-xl"
          style={{ fontFamily: "var(--font-maitree)" }}
>>>>>>> Stashed changes
        >
          Start Learning Smarter
        </Link>
      </div>
    </div>
  );
}
