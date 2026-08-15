import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const exerciseId = String(body?.exerciseId ?? "");
  const weight = Number(body?.weight);
  const sets = Number(body?.sets);
  const reps = Number(body?.reps);
  const rir = body?.rir == null ? null : Number(body.rir);
  const notes = typeof body?.notes === "string" ? body.notes.trim() || null : null;
  const isWarmup = Boolean(body?.isWarmup);

  if (!exerciseId) {
    return NextResponse.json({ error: "Missing exercise." }, { status: 400 });
  }
  if (!Number.isFinite(weight) || weight < 0) {
    return NextResponse.json({ error: "Enter a valid weight." }, { status: 400 });
  }
  if (!Number.isInteger(sets) || sets < 1) {
    return NextResponse.json({ error: "Enter a valid number of sets." }, { status: 400 });
  }
  if (!Number.isInteger(reps) || reps < 1) {
    return NextResponse.json({ error: "Enter a valid number of reps." }, { status: 400 });
  }
  if (rir != null && (!Number.isInteger(rir) || rir < 0 || rir > 10)) {
    return NextResponse.json(
      { error: "RIR must be a whole number between 0 and 10." },
      { status: 400 }
    );
  }

  const previousBest = await prisma.workoutLog.aggregate({
    where: { userId: user.id, exerciseId, isWarmup: false },
    _max: { weight: true },
  });

  await prisma.workoutLog.create({
    data: {
      userId: user.id,
      exerciseId,
      weight,
      sets,
      reps,
      rir,
      notes,
      isWarmup,
    },
  });

  const previousBestWeight = previousBest._max.weight;
  const isNewPR = !isWarmup && previousBestWeight !== null && weight > previousBestWeight;

  return NextResponse.json({ isNewPR, previousBest: previousBestWeight });
}
