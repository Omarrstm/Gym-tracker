import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionCookie } from "@/lib/session";

export const verifySession = cache(async () => {
  const payload = await getSessionCookie();
  if (!payload?.sessionId) redirect("/login");

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId as string },
  });

  if (!session || session.expiresAt < new Date()) redirect("/login");

  return { userId: session.userId };
});

export const getUser = cache(async () => {
  const { userId } = await verifySession();
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      heightCm: true,
      weightKg: true,
      dateOfBirth: true,
      sex: true,
    },
  });
});
