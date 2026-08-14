import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export const requireCoachProfile = cache(async () => {
  const { userId } = await verifySession();
  const profile = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!profile) redirect("/coach/profile");
  return profile;
});

export const getCoachProfile = cache(async (userId: string) => {
  return prisma.coachProfile.findUnique({ where: { userId } });
});

export async function getCoachProfileOrThrow(userId: string) {
  const profile = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("You need a coach profile first.");
  return profile;
}

export async function requireAcceptedLink(coachId: string, athleteId: string) {
  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId, athleteId } },
  });
  if (!link || link.status !== "ACCEPTED") throw new Error("Not linked with this athlete.");
  return link;
}

// View-only counterpart to the mutation guard in src/app/program/actions.ts —
// duplicated rather than shared because that file is "use server" and any
// export from it becomes a client-callable action; this stays server-only.
export async function findViewableProgram(programId: string, userId: string) {
  const program = await prisma.program.findFirst({ where: { id: programId } });
  if (!program) return null;
  if (program.userId === userId) return program;
  if (program.assignedByCoachId === userId) {
    const link = await prisma.coachAthlete.findUnique({
      where: { coachId_athleteId: { coachId: userId, athleteId: program.userId } },
    });
    if (link?.status === "ACCEPTED") return program;
  }
  return null;
}
