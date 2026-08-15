import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "session";

type SessionPayload = { sessionId: string };

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await prisma.session.create({ data: { userId, expiresAt } });
  const token = await encrypt({ sessionId: session.id });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

// For the mobile app: same session mechanism as createSession, but the token
// is returned instead of set as a cookie, since the client stores it itself
// (SecureStore) and sends it back as a Bearer header.
export async function createMobileSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await prisma.session.create({ data: { userId, expiresAt } });
  const token = await encrypt({ sessionId: session.id });
  return { token, expiresAt };
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get(COOKIE_NAME)?.value);
  if (payload?.sessionId) {
    await prisma.session.delete({ where: { id: payload.sessionId } }).catch(() => {});
  }
  cookieStore.delete(COOKIE_NAME);
}
