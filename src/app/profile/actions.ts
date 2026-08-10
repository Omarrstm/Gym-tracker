"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export type ProfileFormState = { error?: string; success?: string } | undefined;

export async function updateName(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Enter your name." };

  const { userId } = await verifySession();
  await prisma.user.update({ where: { id: userId }, data: { name } });

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: "Name updated." };
}

export async function updatePassword(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "New passwords don't match." };

  const { userId } = await verifySession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return { error: "Current password is incorrect." };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

  return { success: "Password updated." };
}

export async function updateBodyStats(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const heightCm = Number(formData.get("heightCm"));
  const weightKg = Number(formData.get("weightKg"));
  const dateOfBirthRaw = String(formData.get("dateOfBirth") ?? "");
  const sex = String(formData.get("sex") ?? "");

  if (!Number.isFinite(heightCm) || heightCm < 50 || heightCm > 272) {
    return { error: "Enter a valid height in cm." };
  }
  if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400) {
    return { error: "Enter a valid weight in kg." };
  }
  const dateOfBirth = new Date(dateOfBirthRaw);
  if (!dateOfBirthRaw || Number.isNaN(dateOfBirth.getTime())) {
    return { error: "Enter a valid date of birth." };
  }
  if (dateOfBirth > new Date()) {
    return { error: "Date of birth can't be in the future." };
  }
  if (sex !== "MALE" && sex !== "FEMALE") {
    return { error: "Select a biological sex." };
  }

  const { userId } = await verifySession();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { heightCm, weightKg, dateOfBirth, sex: sex as "MALE" | "FEMALE" },
    }),
    prisma.bodyWeightLog.create({ data: { userId, weightKg } }),
  ]);

  revalidatePath("/profile");
  return { success: "Body stats updated." };
}

export async function logBodyWeight(weightKg: number) {
  if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400) {
    throw new Error("Enter a valid weight in kg.");
  }

  const { userId } = await verifySession();
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { weightKg } }),
    prisma.bodyWeightLog.create({ data: { userId, weightKg } }),
  ]);

  revalidatePath("/profile");
}

export async function deleteBodyWeightLog(logId: string) {
  const { userId } = await verifySession();
  const log = await prisma.bodyWeightLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error("Entry not found.");

  await prisma.bodyWeightLog.delete({ where: { id: logId } });

  const latest = await prisma.bodyWeightLog.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { weightKg: latest?.weightKg ?? null },
  });

  revalidatePath("/profile");
}
