import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const log = await prisma.workoutLog.findFirst({ where: { id, userId: user.id } });
  if (!log) return NextResponse.json({ error: "Log entry not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const weight = Number(body?.weight);
  const sets = Number(body?.sets);
  const reps = Number(body?.reps);
  const rir = body?.rir == null ? null : Number(body.rir);
  const notes = typeof body?.notes === "string" ? body.notes.trim() || null : null;
  const isWarmup = Boolean(body?.isWarmup);

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

  await prisma.workoutLog.update({
    where: { id },
    data: { weight, sets, reps, rir, notes, isWarmup },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const log = await prisma.workoutLog.findFirst({ where: { id, userId: user.id } });
  if (!log) return NextResponse.json({ error: "Log entry not found." }, { status: 404 });

  await prisma.workoutLog.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
