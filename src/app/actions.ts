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
  rir?: number | null;
  notes?: string | null;
  isWarmup?: boolean;
}) {
  const { exerciseId, weight, sets, reps, rir, notes, isWarmup } = input;

  if (!Number.isFinite(weight) || weight < 0) throw new Error("Enter a valid weight.");
  if (!Number.isInteger(sets) || sets < 1) throw new Error("Enter a valid number of sets.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Enter a valid number of reps.");
  if (rir != null && (!Number.isInteger(rir) || rir < 0 || rir > 10))
    throw new Error("RIR must be a whole number between 0 and 10.");

  const { userId } = await verifySession();

  const previousBest = await prisma.workoutLog.aggregate({
    where: { userId, exerciseId, isWarmup: false },
    _max: { weight: true },
  });

  await prisma.workoutLog.create({
    data: {
      userId,
      exerciseId,
      weight,
      sets,
      reps,
      rir: rir ?? null,
      notes: notes?.trim() ? notes.trim() : null,
      isWarmup: isWarmup ?? false,
    },
  });

  revalidatePath("/");
  revalidatePath("/workout");

  const previousBestWeight = previousBest._max.weight;
  const isNewPR = !isWarmup && previousBestWeight !== null && weight > previousBestWeight;

  return { isNewPR, previousBest: previousBestWeight };
}

export async function updateWorkoutLog(input: {
  logId: string;
  weight: number;
  sets: number;
  reps: number;
  rir?: number | null;
  notes?: string | null;
  isWarmup?: boolean;
}) {
  const { logId, weight, sets, reps, rir, notes, isWarmup } = input;

  if (!Number.isFinite(weight) || weight < 0) throw new Error("Enter a valid weight.");
  if (!Number.isInteger(sets) || sets < 1) throw new Error("Enter a valid number of sets.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Enter a valid number of reps.");
  if (rir != null && (!Number.isInteger(rir) || rir < 0 || rir > 10))
    throw new Error("RIR must be a whole number between 0 and 10.");

  const { userId } = await verifySession();
  const log = await prisma.workoutLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error("Log entry not found.");

  await prisma.workoutLog.update({
    where: { id: logId },
    data: {
      weight,
      sets,
      reps,
      rir: rir ?? null,
      notes: notes?.trim() ? notes.trim() : null,
      isWarmup: isWarmup ?? false,
    },
  });

  revalidatePath("/");
  revalidatePath("/workout");
  revalidatePath("/history");
  revalidatePath(`/history/${log.exerciseId}`);
}

export async function deleteWorkoutLog(logId: string) {
  const { userId } = await verifySession();
  const log = await prisma.workoutLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error("Log entry not found.");

  await prisma.workoutLog.delete({ where: { id: logId } });

  revalidatePath("/");
  revalidatePath("/workout");
  revalidatePath("/history");
  revalidatePath(`/history/${log.exerciseId}`);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
