import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCourses, getSelf } from "~/server/canvas";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { getSession } from "~/server/session";

async function loginAction(formData: FormData) {
  "use server";

  const token = formData.get("token") as string;
  if (!token?.trim()) return;

  let userId: number;
  try {
    const [, self] = await Promise.all([
      getCourses(token.trim()),
      getSelf(token.trim()),
    ]);
    userId = self.id;

    // Store user name for leaderboard (always sync Canvas name)
    await db
      .insert(users)
      .values({ canvasUserId: self.id, name: self.name })
      .onConflictDoUpdate({
        target: users.canvasUserId,
        set: { name: self.name, updatedAt: new Date() },
      });
  } catch {
    redirect("/login?error=invalid");
  }

  const session = await getSession();
  session.canvasToken = token.trim();
  session.canvasUserId = userId;
  await session.save();
  redirect("/dashboard");
}

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  const session = await getSession();
  if (session.canvasToken && !error) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F3FF] p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/cognify-logo-purple.svg"
            alt="Cognify"
            width={189}
            height={69}
            className="h-12 w-auto"
            priority
          />
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#7E6FAE] transition-colors hover:text-[#5B4D8A]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            <span className="text-lg">&larr;</span> Back to home
          </Link>

          <h1
            className="mb-1 text-3xl font-bold text-[#7E6FAE]"
            style={{ fontFamily: "var(--font-josefin-sans)" }}
          >
            Connect to Canvas
          </h1>
          <p
            className="mb-6 text-sm text-[#B0B0B0]"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            Enter your Canvas API access token to get started.
          </p>

          {error === "invalid" && (
            <div
              className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-600"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Invalid token. Please check your token and try again.
            </div>
          )}

          {error === "expired" && (
            <div
              className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-600"
              style={{ fontFamily: "var(--font-average-sans)" }}
            >
              Your token has expired. Please enter a new one.
            </div>
          )}

          <form action={loginAction} className="space-y-5">
            <div>
              <label
                htmlFor="token"
                className="mb-1.5 block text-sm font-medium text-[#5B4D8A]"
                style={{ fontFamily: "var(--font-josefin-sans)" }}
              >
                API Access Token
              </label>
              <input
                id="token"
                name="token"
                type="password"
                placeholder="Paste your Canvas access token"
                required
                className="w-full rounded-xl border-2 border-[#DCD8FF] bg-[#F5F3FF]/50 px-4 py-3 text-gray-800 placeholder-[#B0B0B0] transition-colors focus:border-[#7E6FAE] focus:outline-none"
                style={{ fontFamily: "var(--font-average-sans)" }}
              />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-[#7E6FAE] py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-[#6B5D9A] hover:shadow-lg active:scale-[0.98]"
              style={{ fontFamily: "var(--font-josefin-sans)" }}
            >
              Connect to Canvas
            </button>
          </form>

          {/* Instructions */}
          <div
            className="mt-6 rounded-2xl bg-[#F5F3FF] p-4 text-xs text-[#7E6FAE]/70"
            style={{ fontFamily: "var(--font-average-sans)" }}
          >
            <p className="mb-1.5 font-semibold text-[#5B4D8A]">
              How to get your token:
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Log in to Canvas</li>
              <li>Go to Account &gt; Settings</li>
              <li>Scroll to Approved Integrations</li>
              <li>Click &quot;+ New Access Token&quot;</li>
              <li>Copy the generated token</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
