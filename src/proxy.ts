import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = [
  "/",
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
  return path === route || path.startsWith(route === "/" ? "/__never__" : `${route}/`);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = path === "/" || protectedRoutes.some((r) => r !== "/" && isUnder(path, r));
  const isPublicRoute = publicRoutes.includes(path);

  const token = request.cookies.get("session")?.value;
  let hasValidSession = false;

  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET), {
        algorithms: ["HS256"],
      });
      hasValidSession = true;
    } catch {
      hasValidSession = false;
    }
  }

  if (isProtectedRoute && !hasValidSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute && hasValidSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|backgrounds|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
