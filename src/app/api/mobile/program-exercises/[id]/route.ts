import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

async function requireOwnedProgramExercise(programExerciseId: string, userId: string) {
  const pe = await prisma.programExercise.findFirst({
    where: { id: programExerciseId },
    include: { programDay: { include: { program: true } } },
  });
  if (!pe || pe.programDay.program.userId !== userId) return null;
  return pe;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pe = await requireOwnedProgramExercise(id, user.id);
  if (!pe) return NextResponse.json({ error: "Exercise entry not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const weight = body?.weight == null ? null : Number(body.weight);
  const sets = body?.sets == null ? null : Number(body.sets);
  const reps = body?.reps == null ? null : Number(body.reps);

  if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
    return NextResponse.json({ error: "Enter a valid weight." }, { status: 400 });
  }
  if (sets !== null && (!Number.isInteger(sets) || sets < 1)) {
    return NextResponse.json({ error: "Enter a valid number of sets." }, { status: 400 });
  }
  if (reps !== null && (!Number.isInteger(reps) || reps < 1)) {
    return NextResponse.json({ error: "Enter a valid number of reps." }, { status: 400 });
  }

  await prisma.programExercise.update({
    where: { id },
    data: { targetWeight: weight, targetSets: sets, targetReps: reps },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pe = await requireOwnedProgramExercise(id, user.id);
  if (!pe) return NextResponse.json({ error: "Exercise entry not found." }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.programExercise.delete({ where: { id } });
    const remaining = await tx.programExercise.findMany({
      where: { programDayId: pe.programDayId },
      orderBy: { order: "asc" },
    });
    await Promise.all(
      remaining.map((r, i) => tx.programExercise.update({ where: { id: r.id }, data: { order: i } }))
    );
  });

  return NextResponse.json({ ok: true });
}
