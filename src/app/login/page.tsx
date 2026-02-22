import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-md">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-blue-600 hover:underline"
        >
          &larr; Back to home
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Connect to Canvas
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Enter your Canvas API access token to get started.
        </p>

        {error === "invalid" && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Invalid token. Please check your token and try again.
          </div>
        )}

        {error === "expired" && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Your token has expired. Please enter a new one.
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="token"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              API Access Token
            </label>
            <Input
              id="token"
              name="token"
              type="password"
              placeholder="Paste your Canvas access token"
              required
            />
          </div>

          <Button type="submit" className="w-full py-3">
            Connect to Canvas
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
          <p className="mb-1 font-semibold">How to get your token:</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>Log in to Canvas</li>
            <li>Go to Account &gt; Settings</li>
            <li>Scroll to Approved Integrations</li>
            <li>Click &quot;+ New Access Token&quot;</li>
            <li>Copy the generated token</li>
          </ol>
        </div>
      </Card>
    </main>
  );
}
