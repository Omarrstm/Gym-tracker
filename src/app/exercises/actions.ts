"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { DayOfWeek, MuscleGroup } from "@/generated/prisma/client";

export async function addExerciseToProgram(input: {
  exerciseId: string;
  dayOfWeek: DayOfWeek;
  weight: number;
  sets: number;
  reps: number;
}) {
  const { exerciseId, dayOfWeek, weight, sets, reps } = input;

  if (!Number.isFinite(weight) || weight < 0) throw new Error("Enter a valid weight.");
  if (!Number.isInteger(sets) || sets < 1) throw new Error("Enter a valid number of sets.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Enter a valid number of reps.");

  const { userId } = await verifySession();

  let program = await prisma.program.findFirst({
    where: { userId, isActive: true },
  });
  if (!program) {
    program = await prisma.program.create({
      data: { userId, name: "My Program", isActive: true },
    });
  }

  const programDay = await prisma.programDay.upsert({
    where: { programId_dayOfWeek: { programId: program.id, dayOfWeek } },
    update: {},
    create: { programId: program.id, dayOfWeek },
  });

  const existingCount = await prisma.programExercise.count({
    where: { programDayId: programDay.id },
  });

  await prisma.programExercise.create({
    data: {
      programDayId: programDay.id,
      exerciseId,
      order: existingCount,
      targetWeight: weight,
      targetSets: sets,
      targetReps: reps,
    },
  });

  return { programName: program.name };
}

export async function createCustomExercise(input: {
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
}) {
  const name = input.name.trim();
  const description = input.description?.trim() || null;

  if (name.length < 2) throw new Error("Enter an exercise name.");

  const { userId } = await verifySession();

  const existing = await prisma.exercise.findUnique({ where: { name } });
  if (existing) throw new Error("An exercise with that name already exists.");

  const exercise = await prisma.exercise.create({
    data: { name, muscleGroup: input.muscleGroup, description, createdByUserId: userId },
  });

  revalidatePath("/exercises");
  return { id: exercise.id };
}

export async function deleteCustomExercise(exerciseId: string) {
  const { userId } = await verifySession();

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, createdByUserId: userId },
  });
  if (!exercise) throw new Error("Exercise not found.");

  const [logCount, programCount] = await Promise.all([
    prisma.workoutLog.count({ where: { exerciseId } }),
    prisma.programExercise.count({ where: { exerciseId } }),
  ]);
  if (logCount > 0 || programCount > 0) {
    throw new Error("Remove it from your history and programs before deleting it.");
  }

  await prisma.exercise.delete({ where: { id: exerciseId } });

  revalidatePath("/exercises");
}
