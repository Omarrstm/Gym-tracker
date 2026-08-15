import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const protectedRoutes = [
  "/exercises",
  "/history",
  "/profile",
  "/program",
  "/stats",
  "/workout",
  "/coach",
  "/coaches",
];
const publicRoutes = ["/login", "/signup"];

function isUnder(path: string, route: string) {
  return path === route || path.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((r) => isUnder(path, r));
  const isPublicRoute = publicRoutes.includes(path);

  const token = request.cookies.get("session")?.value;
  let sessionId: string | null = null;

  if (token && process.env.SESSION_SECRET) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SESSION_SECRET),
        { algorithms: ["HS256"] },
      );
      sessionId = (payload.sessionId as string) ?? null;
    } catch {
      sessionId = null;
    }
  }

  // A signed cookie only proves the token wasn't tampered with, not that the
  // session still exists (e.g. it was revoked or the DB was reset). That gap
  // only matters here: falsely treating a dead session as valid would bounce
  // the visitor away from /login or /signup with no way back in. Protected
  // routes stay on the cheap JWT-only check and rely on dal.ts's DB-backed
  // check to redirect them to /login for a real fix.
  if (isPublicRoute && sessionId) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    const hasValidSession = !!session && session.expiresAt > new Date();

    if (hasValidSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.next();
    response.cookies.delete("session");
    return response;
  }

  if (isProtectedRoute && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|backgrounds|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
