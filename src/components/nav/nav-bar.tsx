import Link from "next/link";

export function NavBar() {
  return (
    <nav className="border-b border-gray-200 bg-white px-8 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          Canvas Study Tool
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
