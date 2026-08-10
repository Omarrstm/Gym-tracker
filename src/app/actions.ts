"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { deleteSession } from "@/lib/session";

export async function logWorkoutSet(input: {
  exerciseId: string;
  weight: number;
  sets: number;
  reps: number;
}) {
  const { exerciseId, weight, sets, reps } = input;

  if (!Number.isFinite(weight) || weight < 0) throw new Error("Enter a valid weight.");
  if (!Number.isInteger(sets) || sets < 1) throw new Error("Enter a valid number of sets.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Enter a valid number of reps.");

  const { userId } = await verifySession();

  const previousBest = await prisma.workoutLog.aggregate({
    where: { userId, exerciseId },
    _max: { weight: true },
  });

  await prisma.workoutLog.create({
    data: { userId, exerciseId, weight, sets, reps },
  });

  revalidatePath("/");

  const previousBestWeight = previousBest._max.weight;
  const isNewPR = previousBestWeight !== null && weight > previousBestWeight;

  return { isNewPR, previousBest: previousBestWeight };
}

export async function updateWorkoutLog(input: {
  logId: string;
  weight: number;
  sets: number;
  reps: number;
}) {
  const { logId, weight, sets, reps } = input;

  if (!Number.isFinite(weight) || weight < 0) throw new Error("Enter a valid weight.");
  if (!Number.isInteger(sets) || sets < 1) throw new Error("Enter a valid number of sets.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Enter a valid number of reps.");

  const { userId } = await verifySession();
  const log = await prisma.workoutLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error("Log entry not found.");

  await prisma.workoutLog.update({ where: { id: logId }, data: { weight, sets, reps } });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/history/${log.exerciseId}`);
}

export async function deleteWorkoutLog(logId: string) {
  const { userId } = await verifySession();
  const log = await prisma.workoutLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error("Log entry not found.");

  await prisma.workoutLog.delete({ where: { id: logId } });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/history/${log.exerciseId}`);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
