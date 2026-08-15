import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";
import type { MuscleGroup } from "@/generated/prisma/client";
import {
  buildHeatmapGrid,
  computeDailyVolumes,
  computeStreak,
  getWeekStart,
  sumVolumeInRange,
} from "@/lib/stats";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setUTCDate(today.getUTCDate() - 89);
  ninetyDaysAgo.setUTCHours(0, 0, 0, 0);

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id, isWarmup: false, date: { gte: ninetyDaysAgo } },
    select: {
      date: true,
      weight: true,
      sets: true,
      reps: true,
      exercise: { select: { muscleGroup: true } },
    },
  });

  const dailyVolumes = computeDailyVolumes(logs);
  const streak = computeStreak(dailyVolumes, today);

  const thisWeekStart = getWeekStart(today);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);

  const thisWeekVolume = sumVolumeInRange(dailyVolumes, thisWeekStart, nextWeekStart);
  const lastWeekVolume = sumVolumeInRange(dailyVolumes, lastWeekStart, thisWeekStart);
  const weekDelta = lastWeekVolume > 0 ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 : null;

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(today.getUTCDate() - 29);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const volumeByMuscleGroup = new Map<MuscleGroup, number>();
  for (const log of logs) {
    if (log.date < thirtyDaysAgo) continue;
    const volume = log.weight * log.sets * log.reps;
    const mg = log.exercise.muscleGroup;
    volumeByMuscleGroup.set(mg, (volumeByMuscleGroup.get(mg) ?? 0) + volume);
  }
  const muscleGroupRanking = [...volumeByMuscleGroup.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([muscleGroup, volume]) => ({ muscleGroup, volume }));

  const heatmap = buildHeatmapGrid(dailyVolumes, today);

  return NextResponse.json({
    streak,
    thisWeekVolume,
    weekDelta,
    muscleGroupRanking,
    heatmap,
  });
}
