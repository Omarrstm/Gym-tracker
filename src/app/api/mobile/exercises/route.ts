import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ createdByUserId: null }, { createdByUserId: user.id }] },
    select: {
      id: true,
      name: true,
      muscleGroup: true,
      imageUrl: true,
      description: true,
      createdByUserId: true,
    },
    orderBy: { name: "asc" },
  });

  const prs = await prisma.workoutLog.groupBy({
    by: ["exerciseId"],
    where: { userId: user.id, isWarmup: false },
    _max: { weight: true },
  });
  const prByExercise = Object.fromEntries(prs.map((p) => [p.exerciseId, p._max.weight as number]));

  return NextResponse.json({ exercises, prByExercise });
}
