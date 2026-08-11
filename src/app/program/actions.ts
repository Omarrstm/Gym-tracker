"use server";

import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import type { DayOfWeek } from "@/generated/prisma/client";

async function requireOwnedProgram(programId: string, userId: string) {
  const program = await prisma.program.findFirst({ where: { id: programId, userId } });
  if (!program) throw new Error("Program not found.");
  return program;
}

async function requireOwnedProgramExercise(programExerciseId: string, userId: string) {
  const programExercise = await prisma.programExercise.findFirst({
    where: { id: programExerciseId, programDay: { program: { userId } } },
    include: { programDay: true },
  });
  if (!programExercise) throw new Error("Exercise entry not found.");
  return programExercise;
}

export async function createProgram(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error("Enter a program name.");

  const { userId } = await verifySession();
  const existingCount = await prisma.program.count({ where: { userId } });
  const program = await prisma.program.create({
    data: { userId, name: trimmed, isActive: existingCount === 0 },
  });

  revalidatePath("/program");
  return { id: program.id };
}

export async function renameProgram(programId: string, name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error("Enter a program name.");

  const { userId } = await verifySession();
  await requireOwnedProgram(programId, userId);
  await prisma.program.update({ where: { id: programId }, data: { name: trimmed } });

  revalidatePath("/program");
  revalidatePath(`/program/${programId}`);
}

export async function setActiveProgram(programId: string) {
  const { userId } = await verifySession();
  await requireOwnedProgram(programId, userId);

  await prisma.$transaction([
    prisma.program.updateMany({ where: { userId, id: { not: programId } }, data: { isActive: false } }),
    prisma.program.update({ where: { id: programId }, data: { isActive: true } }),
  ]);

  revalidatePath("/program");
  revalidatePath("/");
}

export async function duplicateProgram(programId: string) {
  const { userId } = await verifySession();
  await requireOwnedProgram(programId, userId);

  const source = await prisma.program.findUniqueOrThrow({
    where: { id: programId },
    include: {
      days: {
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });

  const copy = await prisma.program.create({
    data: {
      userId,
      name: `${source.name} (Copy)`,
      isActive: false,
      days: {
        create: source.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          exercises: {
            create: day.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              targetWeight: ex.targetWeight,
              targetSets: ex.targetSets,
              targetReps: ex.targetReps,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/program");
  return { id: copy.id };
}

export async function deleteProgram(programId: string) {
  const { userId } = await verifySession();
  const program = await requireOwnedProgram(programId, userId);

  await prisma.program.delete({ where: { id: programId } });

  if (program.isActive) {
    const next = await prisma.program.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
    if (next) await prisma.program.update({ where: { id: next.id }, data: { isActive: true } });
  }

  revalidatePath("/program");
  revalidatePath("/");
}

export async function addProgramExercise(input: {
  programId: string;
  dayOfWeek: DayOfWeek;
  exerciseId: string;
  weight: number;
  sets: number;
  reps: number;
}) {
  const { programId, dayOfWeek, exerciseId, weight, sets, reps } = input;

  if (!Number.isFinite(weight) || weight < 0) throw new Error("Enter a valid weight.");
  if (!Number.isInteger(sets) || sets < 1) throw new Error("Enter a valid number of sets.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Enter a valid number of reps.");

  const { userId } = await verifySession();
  await requireOwnedProgram(programId, userId);

  const programDay = await prisma.programDay.upsert({
    where: { programId_dayOfWeek: { programId, dayOfWeek } },
    update: {},
    create: { programId, dayOfWeek },
  });

  const existingCount = await prisma.programExercise.count({ where: { programDayId: programDay.id } });

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

  revalidatePath(`/program/${programId}`);
  revalidatePath("/");
}

export async function updateProgramExercise(input: {
  programExerciseId: string;
  weight: number;
  sets: number;
  reps: number;
}) {
  const { programExerciseId, weight, sets, reps } = input;

  if (!Number.isFinite(weight) || weight < 0) throw new Error("Enter a valid weight.");
  if (!Number.isInteger(sets) || sets < 1) throw new Error("Enter a valid number of sets.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Enter a valid number of reps.");

  const { userId } = await verifySession();
  const pe = await requireOwnedProgramExercise(programExerciseId, userId);

  await prisma.programExercise.update({
    where: { id: programExerciseId },
    data: { targetWeight: weight, targetSets: sets, targetReps: reps },
  });

  revalidatePath(`/program/${pe.programDay.programId}`);
  revalidatePath("/");
}

export async function removeProgramExercise(programExerciseId: string) {
  const { userId } = await verifySession();
  const pe = await requireOwnedProgramExercise(programExerciseId, userId);

  await prisma.$transaction(async (tx) => {
    await tx.programExercise.delete({ where: { id: programExerciseId } });
    const remaining = await tx.programExercise.findMany({
      where: { programDayId: pe.programDayId },
      orderBy: { order: "asc" },
    });
    await Promise.all(
      remaining.map((r, i) => tx.programExercise.update({ where: { id: r.id }, data: { order: i } }))
    );
  });

  revalidatePath(`/program/${pe.programDay.programId}`);
  revalidatePath("/");
}

export async function moveProgramExercise(programExerciseId: string, direction: "up" | "down") {
  const { userId } = await verifySession();
  const pe = await requireOwnedProgramExercise(programExerciseId, userId);

  const siblings = await prisma.programExercise.findMany({
    where: { programDayId: pe.programDayId },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((s) => s.id === programExerciseId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapWith];
  await prisma.$transaction([
    prisma.programExercise.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.programExercise.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/program/${pe.programDay.programId}`);
}
