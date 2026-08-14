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

// Grants access to a program's owner (the athlete) as well as the coach who
// assigned it, so long as the coach<->athlete link is still ACCEPTED. Used to
// gate structure edits (rename/days/exercises); lifecycle actions like
// activate/delete/duplicate stay athlete-only via requireOwnedProgram above.
async function requireProgramAccess(programId: string, userId: string) {
  const program = await prisma.program.findFirst({ where: { id: programId } });
  if (!program) throw new Error("Program not found.");
  if (program.userId === userId) return program;
  if (program.assignedByCoachId === userId) {
    const link = await prisma.coachAthlete.findUnique({
      where: { coachId_athleteId: { coachId: userId, athleteId: program.userId } },
    });
    if (link?.status === "ACCEPTED") return program;
  }
  throw new Error("Program not found.");
}

async function requireProgramExerciseAccess(programExerciseId: string, userId: string) {
  const programExercise = await prisma.programExercise.findFirst({
    where: { id: programExerciseId },
    include: { programDay: true },
  });
  if (!programExercise) throw new Error("Exercise entry not found.");
  await requireProgramAccess(programExercise.programDay.programId, userId);
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
  await requireProgramAccess(programId, userId);
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
  revalidatePath("/workout");
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
  revalidatePath("/workout");
}

export async function addProgramExercise(input: {
  programId: string;
  dayOfWeek: DayOfWeek;
  exerciseId: string;
  weight?: number | null;
  sets?: number | null;
  reps?: number | null;
}) {
  const { programId, dayOfWeek, exerciseId } = input;
  const weight = input.weight ?? null;
  const sets = input.sets ?? null;
  const reps = input.reps ?? null;

  if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
    throw new Error("Enter a valid weight.");
  }
  if (sets !== null && (!Number.isInteger(sets) || sets < 1)) {
    throw new Error("Enter a valid number of sets.");
  }
  if (reps !== null && (!Number.isInteger(reps) || reps < 1)) {
    throw new Error("Enter a valid number of reps.");
  }

  const { userId } = await verifySession();
  await requireProgramAccess(programId, userId);

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
  revalidatePath("/workout");
}

export async function updateProgramDayLabel(input: {
  programId: string;
  dayOfWeek: DayOfWeek;
  label: string;
}) {
  const { programId, dayOfWeek } = input;
  const label = input.label.trim() || null;

  const { userId } = await verifySession();
  await requireProgramAccess(programId, userId);

  await prisma.programDay.upsert({
    where: { programId_dayOfWeek: { programId, dayOfWeek } },
    update: { label },
    create: { programId, dayOfWeek, label },
  });

  revalidatePath(`/program/${programId}`);
  revalidatePath("/");
  revalidatePath("/workout");
}

export async function updateProgramDayNotes(input: {
  programId: string;
  dayOfWeek: DayOfWeek;
  notes: string;
}) {
  const { programId, dayOfWeek } = input;
  const notes = input.notes.trim() || null;

  const { userId } = await verifySession();
  await requireProgramAccess(programId, userId);

  await prisma.programDay.upsert({
    where: { programId_dayOfWeek: { programId, dayOfWeek } },
    update: { notes },
    create: { programId, dayOfWeek, notes },
  });

  revalidatePath(`/program/${programId}`);
  revalidatePath("/");
  revalidatePath("/workout");
}

export async function updateProgramExercise(input: {
  programExerciseId: string;
  weight?: number | null;
  sets?: number | null;
  reps?: number | null;
}) {
  const { programExerciseId } = input;
  const weight = input.weight ?? null;
  const sets = input.sets ?? null;
  const reps = input.reps ?? null;

  if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
    throw new Error("Enter a valid weight.");
  }
  if (sets !== null && (!Number.isInteger(sets) || sets < 1)) {
    throw new Error("Enter a valid number of sets.");
  }
  if (reps !== null && (!Number.isInteger(reps) || reps < 1)) {
    throw new Error("Enter a valid number of reps.");
  }

  const { userId } = await verifySession();
  const pe = await requireProgramExerciseAccess(programExerciseId, userId);

  await prisma.programExercise.update({
    where: { id: programExerciseId },
    data: { targetWeight: weight, targetSets: sets, targetReps: reps },
  });

  revalidatePath(`/program/${pe.programDay.programId}`);
  revalidatePath("/");
  revalidatePath("/workout");
}

export async function removeProgramExercise(programExerciseId: string) {
  const { userId } = await verifySession();
  const pe = await requireProgramExerciseAccess(programExerciseId, userId);

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
  revalidatePath("/workout");
}

export async function moveProgramExercise(programExerciseId: string, direction: "up" | "down") {
  const { userId } = await verifySession();
  const pe = await requireProgramExerciseAccess(programExerciseId, userId);

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
  revalidatePath("/");
  revalidatePath("/workout");
}
