import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import type { MuscleGroup } from "@/generated/prisma/client";

type PRRow = { exerciseId: string; name: string; muscleGroup: MuscleGroup; weight: number; date: Date };

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id, isWarmup: false },
    orderBy: { date: "asc" },
    include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
  });

  const prByExercise = new Map<string, PRRow>();
  for (const log of logs) {
    const existing = prByExercise.get(log.exerciseId);
    if (!existing || log.weight > existing.weight) {
      prByExercise.set(log.exerciseId, {
        exerciseId: log.exerciseId,
        name: log.exercise.name,
        muscleGroup: log.exercise.muscleGroup,
        weight: log.weight,
        date: log.date,
      });
    }
  }
  const prs = [...prByExercise.values()].sort((a, b) => b.date.getTime() - a.date.getTime());

  return NextResponse.json({ prs });
}
