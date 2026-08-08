"use server";

import prisma from "@/lib/prisma";
import { getDevUserId } from "@/lib/devUser";
import type { DayOfWeek } from "@/generated/prisma/client";

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

  const userId = await getDevUserId();

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
