"use server";

import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

async function findLink(userId: string, counterpartUserId: string) {
  const link = await prisma.coachAthlete.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { coachId: userId, athleteId: counterpartUserId },
        { coachId: counterpartUserId, athleteId: userId },
      ],
    },
  });
  if (!link) throw new Error("You're not linked with this person.");
  return link;
}

export async function sendMessage(counterpartUserId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Message can't be empty.");
  if (trimmed.length > 2000) throw new Error("Message is too long.");

  const { userId } = await verifySession();
  const link = await findLink(userId, counterpartUserId);

  await prisma.message.create({
    data: { coachAthleteId: link.id, senderId: userId, body: trimmed },
  });

  const isCoach = link.coachId === userId;
  revalidatePath(
    isCoach ? `/coach/athletes/${counterpartUserId}/messages` : `/coach/athletes/${userId}/messages`
  );
  revalidatePath(
    isCoach ? `/coaches/mine/${userId}/messages` : `/coaches/mine/${counterpartUserId}/messages`
  );
}

export async function markThreadRead(counterpartUserId: string) {
  const { userId } = await verifySession();
  const link = await findLink(userId, counterpartUserId);

  await prisma.message.updateMany({
    where: { coachAthleteId: link.id, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
}
