import { redirect } from "next/navigation";
import { getSession } from "~/server/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
