"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getDevUserId } from "@/lib/devUser";

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

  const userId = await getDevUserId();

  await prisma.workoutLog.create({
    data: { userId, exerciseId, weight, sets, reps },
  });

  revalidatePath("/");
}
