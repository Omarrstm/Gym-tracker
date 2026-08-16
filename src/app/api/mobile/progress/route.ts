import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import type { MuscleGroup } from "@/generated/prisma/client";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id, isWarmup: false },
    orderBy: { date: "asc" },
    include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
  });

  const byExercise = new Map<
    string,
    { name: string; muscleGroup: MuscleGroup; days: Set<string>; lastDate: Date }
  >();
  for (const log of logs) {
    const existing = byExercise.get(log.exerciseId);
    const key = dayKey(log.date);
    if (existing) {
      existing.days.add(key);
      if (log.date > existing.lastDate) existing.lastDate = log.date;
    } else {
      byExercise.set(log.exerciseId, {
        name: log.exercise.name,
        muscleGroup: log.exercise.muscleGroup,
        days: new Set([key]),
        lastDate: log.date,
      });
    }
  }

  const exercises = [...byExercise.entries()]
    .map(([exerciseId, v]) => ({
      exerciseId,
      name: v.name,
      muscleGroup: v.muscleGroup,
      sessionCount: v.days.size,
      lastDate: v.lastDate,
    }))
    .sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());

  return NextResponse.json({ exercises });
}
