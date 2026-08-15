import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import { dayOrder } from "@/lib/days";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const program = await prisma.program.findFirst({ where: { id, userId: user.id } });
  if (!program) return NextResponse.json({ error: "Program not found." }, { status: 404 });

  const days = await prisma.programDay.findMany({
    where: { programId: id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
      },
    },
  });

  const allExercises = await prisma.exercise.findMany({
    select: { id: true, name: true, muscleGroup: true },
    orderBy: { name: "asc" },
  });

  const dayMap = new Map(days.map((d) => [d.dayOfWeek, d]));

  return NextResponse.json({
    program: { id: program.id, name: program.name, isActive: program.isActive },
    days: dayOrder.map((dayOfWeek) => {
      const day = dayMap.get(dayOfWeek);
      return {
        dayOfWeek,
        label: day?.label ?? null,
        notes: day?.notes ?? null,
        exercises: (day?.exercises ?? []).map((pe) => ({
          id: pe.id,
          exercise: pe.exercise,
          targetWeight: pe.targetWeight,
          targetSets: pe.targetSets,
          targetReps: pe.targetReps,
        })),
      };
    }),
    allExercises,
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const program = await prisma.program.findFirst({ where: { id, userId: user.id } });
  if (!program) return NextResponse.json({ error: "Program not found." }, { status: 404 });

  await prisma.program.delete({ where: { id } });

  if (program.isActive) {
    const next = await prisma.program.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    if (next) await prisma.program.update({ where: { id: next.id }, data: { isActive: true } });
  }

  return NextResponse.json({ ok: true });
}
