import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import type { DayOfWeek } from "@/generated/prisma/client";

const VALID_DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const program = await prisma.program.findFirst({ where: { id, userId: user.id } });
  if (!program) return NextResponse.json({ error: "Program not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const dayOfWeek = String(body?.dayOfWeek ?? "") as DayOfWeek;
  const exerciseId = String(body?.exerciseId ?? "");
  const weight = body?.weight == null ? null : Number(body.weight);
  const sets = body?.sets == null ? null : Number(body.sets);
  const reps = body?.reps == null ? null : Number(body.reps);

  if (!VALID_DAYS.includes(dayOfWeek)) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }
  if (!exerciseId) {
    return NextResponse.json({ error: "Missing exercise." }, { status: 400 });
  }
  if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
    return NextResponse.json({ error: "Enter a valid weight." }, { status: 400 });
  }
  if (sets !== null && (!Number.isInteger(sets) || sets < 1)) {
    return NextResponse.json({ error: "Enter a valid number of sets." }, { status: 400 });
  }
  if (reps !== null && (!Number.isInteger(reps) || reps < 1)) {
    return NextResponse.json({ error: "Enter a valid number of reps." }, { status: 400 });
  }

  const programDay = await prisma.programDay.upsert({
    where: { programId_dayOfWeek: { programId: id, dayOfWeek } },
    update: {},
    create: { programId: id, dayOfWeek },
  });

  const existingCount = await prisma.programExercise.count({
    where: { programDayId: programDay.id },
  });

  const created = await prisma.programExercise.create({
    data: {
      programDayId: programDay.id,
      exerciseId,
      order: existingCount,
      targetWeight: weight,
      targetSets: sets,
      targetReps: reps,
    },
  });

  return NextResponse.json({ id: created.id });
}
