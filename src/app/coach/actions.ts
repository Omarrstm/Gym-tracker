"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import { generateUniqueJoinCode } from "@/lib/joinCode";
import { sendCoachInviteEmail } from "@/lib/email";
import { computeTrialEndsAt } from "@/lib/billing";

export type CoachFormState = { error?: string; success?: string } | undefined;

const INVITE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function parseSpecialties(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function upsertCoachProfile(
  _prevState: CoachFormState,
  formData: FormData
): Promise<CoachFormState> {
  const bio = String(formData.get("bio") ?? "").trim();
  const specialties = parseSpecialties(String(formData.get("specialties") ?? ""));
  const isPublic = formData.get("isPublic") === "on";

  const { userId } = await verifySession();
  const existing = await prisma.coachProfile.findUnique({ where: { userId } });

  if (existing) {
    await prisma.coachProfile.update({
      where: { userId },
      data: { bio: bio || null, specialties, isPublic },
    });
  } else {
    const joinCode = await generateUniqueJoinCode();
    await prisma.coachProfile.create({
      data: {
        userId,
        bio: bio || null,
        specialties,
        isPublic,
        joinCode,
        trialEndsAt: computeTrialEndsAt(),
      },
    });
  }

  revalidatePath("/coach/profile");
  revalidatePath("/coach");
  revalidatePath("/coaches");
  return { success: "Coach profile saved." };
}

export async function regenerateJoinCode() {
  const { userId } = await verifySession();
  const profile = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("You don't have a coach profile yet.");

  const joinCode = await generateUniqueJoinCode();
  await prisma.coachProfile.update({ where: { userId }, data: { joinCode } });

  revalidatePath("/coach/profile");
}

export async function joinByCode(code: string) {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) throw new Error("Enter a join code.");

  const { userId } = await verifySession();
  const profile = await prisma.coachProfile.findUnique({ where: { joinCode: trimmed } });
  if (!profile) throw new Error("No coach found with that code.");
  if (profile.userId === userId) throw new Error("You can't join your own coach profile.");

  await prisma.coachAthlete.upsert({
    where: { coachId_athleteId: { coachId: profile.userId, athleteId: userId } },
    update: { status: "ACCEPTED", source: "JOIN_CODE", respondedAt: new Date() },
    create: { coachId: profile.userId, athleteId: userId, status: "ACCEPTED", source: "JOIN_CODE" },
  });

  revalidatePath("/coaches/mine");
  revalidatePath("/coach");
}

export async function requestCoach(coachUserId: string) {
  const { userId } = await verifySession();
  if (coachUserId === userId) throw new Error("You can't request yourself as a coach.");

  const profile = await prisma.coachProfile.findUnique({ where: { userId: coachUserId } });
  if (!profile || !profile.isPublic) throw new Error("Coach not found.");

  const existing = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId: coachUserId, athleteId: userId } },
  });
  if (existing && existing.status === "ACCEPTED") throw new Error("You're already linked with this coach.");
  if (existing && existing.status === "PENDING") throw new Error("You already have a pending request.");

  await prisma.coachAthlete.upsert({
    where: { coachId_athleteId: { coachId: coachUserId, athleteId: userId } },
    update: { status: "PENDING", source: "DIRECTORY_REQUEST", respondedAt: null },
    create: { coachId: coachUserId, athleteId: userId, status: "PENDING", source: "DIRECTORY_REQUEST" },
  });

  revalidatePath("/coaches/mine");
  revalidatePath(`/coaches/${coachUserId}`);
  revalidatePath("/coach");
}

export async function respondToRequest(athleteId: string, accept: boolean) {
  const { userId } = await verifySession();
  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId: userId, athleteId } },
  });
  if (!link || link.status !== "PENDING") throw new Error("Request not found.");

  await prisma.coachAthlete.update({
    where: { id: link.id },
    data: { status: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
  });

  revalidatePath("/coach");
  revalidatePath("/coaches/mine");
}

export async function revokeLink(counterpartUserId: string) {
  const { userId } = await verifySession();

  const link = await prisma.coachAthlete.findFirst({
    where: {
      OR: [
        { coachId: userId, athleteId: counterpartUserId },
        { coachId: counterpartUserId, athleteId: userId },
      ],
    },
  });
  if (!link) throw new Error("Link not found.");

  await prisma.$transaction([
    prisma.coachAthlete.update({
      where: { id: link.id },
      data: { status: "REVOKED", respondedAt: new Date() },
    }),
    prisma.program.updateMany({
      where: { userId: link.athleteId, assignedByCoachId: link.coachId },
      data: { assignedByCoachId: null },
    }),
  ]);

  revalidatePath("/coach");
  revalidatePath("/coaches/mine");
}

export async function sendCoachInvite(
  _prevState: CoachFormState,
  formData: FormData
): Promise<CoachFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { error: "Enter a valid email address." };

  const { userId } = await verifySession();
  const [profile, coach] = await Promise.all([
    prisma.coachProfile.findUnique({ where: { userId } }),
    getUser(),
  ]);
  if (!profile) return { error: "You need a coach profile first." };

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + INVITE_DURATION_MS);

  await prisma.coachInvite.create({
    data: { coachId: userId, email, tokenHash, expiresAt },
  });

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const inviteUrl = `${protocol}://${host}/coach-invite/${token}`;

  try {
    await sendCoachInviteEmail(email, coach.name ?? "A coach", inviteUrl);
  } catch (e) {
    console.error("Failed to send coach invite email:", e);
    return { error: "Couldn't send the invite email. Try again." };
  }

  revalidatePath("/coach");
  return { success: `Invite sent to ${email}.` };
}

function parseYear(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const year = Number(value);
  return Number.isInteger(year) ? year : null;
}

export type ExperienceFormState = { error?: string; success?: boolean } | undefined;

export async function addCoachExperience(
  _prevState: ExperienceFormState,
  formData: FormData
): Promise<ExperienceFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startYear = parseYear(formData.get("startYear"));
  const endYear = parseYear(formData.get("endYear"));

  if (!title) return { error: "Enter a title." };

  const { userId } = await verifySession();
  const profile = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!profile) return { error: "You need a coach profile first." };

  const last = await prisma.coachExperience.findFirst({
    where: { coachProfileId: profile.id },
    orderBy: { order: "desc" },
  });

  await prisma.coachExperience.create({
    data: {
      coachProfileId: profile.id,
      title,
      organization: organization || null,
      description: description || null,
      startYear,
      endYear,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath("/coach/profile");
  revalidatePath("/coaches");
  return { success: true };
}

export async function deleteCoachExperience(experienceId: string) {
  const { userId } = await verifySession();
  const profile = await prisma.coachProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("You don't have a coach profile.");

  await prisma.coachExperience.deleteMany({
    where: { id: experienceId, coachProfileId: profile.id },
  });

  revalidatePath("/coach/profile");
  revalidatePath("/coaches");
}

export async function acceptCoachInvite(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invite = await prisma.coachInvite.findUnique({ where: { tokenHash } });
  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    throw new Error("This invite is invalid or has expired.");
  }

  const { userId } = await verifySession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new Error("This invite was sent to a different email address.");
  }

  await prisma.$transaction([
    prisma.coachAthlete.upsert({
      where: { coachId_athleteId: { coachId: invite.coachId, athleteId: userId } },
      update: { status: "ACCEPTED", source: "EMAIL_INVITE", respondedAt: new Date() },
      create: { coachId: invite.coachId, athleteId: userId, status: "ACCEPTED", source: "EMAIL_INVITE" },
    }),
    prisma.coachInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
  ]);

  revalidatePath("/coach");
  revalidatePath("/coaches/mine");
}
