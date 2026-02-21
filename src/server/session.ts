import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { env } from "~/env";

export type SessionData = {
  canvasToken?: string;
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, {
    password: env.SESSION_SECRET,
    cookieName: "canvas-study-session",
    cookieOptions: {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  });
}
