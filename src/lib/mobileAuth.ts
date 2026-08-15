import "server-only";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const encodedKey = new TextEncoder().encode(secretKey);

export async function getMobileUser(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);

  let sessionId: string | undefined;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    sessionId = payload.sessionId as string | undefined;
  } catch {
    return null;
  }
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.expiresAt < new Date()) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      heightCm: true,
      weightKg: true,
      dateOfBirth: true,
      sex: true,
      restTimerSeconds: true,
    },
  });
}
