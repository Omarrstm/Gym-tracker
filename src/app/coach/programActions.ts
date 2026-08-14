"use server";

import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { requireAcceptedLink } from "@/lib/coachDal";
import { revalidatePath } from "next/cache";

export async function createProgramForAthlete(athleteId: string, name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error("Enter a program name.");

  const { userId: coachId } = await verifySession();
  await requireAcceptedLink(coachId, athleteId);

  const existingCount = await prisma.program.count({ where: { userId: athleteId } });
  const program = await prisma.program.create({
    data: {
      userId: athleteId,
      name: trimmed,
      isActive: existingCount === 0,
      assignedByCoachId: coachId,
    },
  });

  revalidatePath(`/coach/athletes/${athleteId}`);
  return { id: program.id };
}

export async function assignProgramTemplate(templateProgramId: string, athleteId: string) {
  const { userId: coachId } = await verifySession();
  await requireAcceptedLink(coachId, athleteId);

  const template = await prisma.program.findFirst({
    where: { id: templateProgramId, userId: coachId },
    include: { days: { include: { exercises: { orderBy: { order: "asc" } } } } },
  });
  if (!template) throw new Error("Template program not found.");

  const existingCount = await prisma.program.count({ where: { userId: athleteId } });
  const copy = await prisma.program.create({
    data: {
      userId: athleteId,
      name: template.name,
      isActive: existingCount === 0,
      assignedByCoachId: coachId,
      days: {
        create: template.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          label: day.label,
          notes: day.notes,
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

  revalidatePath(`/coach/athletes/${athleteId}`);
  return { id: copy.id };
}

export async function unassignProgram(programId: string) {
  const { userId: coachId } = await verifySession();
  const program = await prisma.program.findFirst({ where: { id: programId, assignedByCoachId: coachId } });
  if (!program) throw new Error("Program not found.");

  await prisma.program.update({ where: { id: programId }, data: { assignedByCoachId: null } });

  revalidatePath(`/coach/athletes/${program.userId}`);
}
