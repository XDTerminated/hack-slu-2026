import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Lavender header + wave ── */}
      <div className="relative">
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

            {/* Login button */}
            <Link
              href="/login"
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
            fill="#DCD8FF"
            d="M0,0 H1440 V120 Q1080,0 720,90 Q360,180 0,60 Z"
          />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div className="-mt-4 flex flex-col items-center px-8 pb-32 text-center">
        <h1
          className="max-w-5xl text-7xl font-bold leading-tight whitespace-nowrap text-[#DCD8FF]"
          style={{ fontFamily: "var(--font-maitree)" }}
        >
          Learning That Adapts to You
        </h1>

        <p className="mt-3 max-w-lg text-2xl leading-relaxed text-[#DCD8FF]">
          Real-time cognitive insights personalize
          your lessons, adjust difficulty, and bridge
          learning gaps as you study.
        </p>

        <Link
          href="/login"
          className="mt-8 rounded-full bg-[#DCD8FF] px-10 py-3.5 text-xl font-semibold text-white shadow-lg transition hover:shadow-xl"
          style={{ fontFamily: "var(--font-maitree)" }}
        >
          Start Learning Smarter
        </Link>
      </div>
    </div>
  );
}
