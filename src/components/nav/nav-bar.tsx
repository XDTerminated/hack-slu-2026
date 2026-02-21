import Link from "next/link";

export function NavBar() {
  return (
    <nav className="border-b border-gray-200 bg-white px-8 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/dashboard" className="flex items-end gap-0.5">
          <span
            className="text-xl tracking-tight text-[#7E6FAE]"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Cognify
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 18 18"
            className="-ml-0.5 mb-0.5"
          >
            <path
              d="M9 0l2.2 6.8L18 9l-6.8 2.2L9 18l-2.2-6.8L0 9l6.8-2.2z"
              fill="#A09850"
            />
          </svg>
        </Link>
        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
