import "server-only";
import prisma from "@/lib/prisma";

// All date bucketing here operates in UTC consistently, since WorkoutLog.date
// is stored as an absolute UTC timestamp and dayKey extracts the UTC calendar
// date. Mixing in local-time methods (setHours, getDay, setDate) would shift
// day boundaries whenever the runtime's local timezone isn't UTC.

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)} kg`;
}

export function computeDailyVolumes(
  logs: { date: Date; weight: number; sets: number; reps: number }[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const log of logs) {
    const key = dayKey(log.date);
    const volume = log.weight * log.sets * log.reps;
    map.set(key, (map.get(key) ?? 0) + volume);
  }
  return map;
}

export function computeStreak(dailyVolumes: Map<string, number>, today: Date): number {
  const cursor = new Date(today);
  cursor.setUTCHours(0, 0, 0, 0);

  if (!dailyVolumes.has(dayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (dailyVolumes.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function getWeekStart(d: Date): Date {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

export function sumVolumeInRange(
  dailyVolumes: Map<string, number>,
  start: Date,
  endExclusive: Date
): number {
  let total = 0;
  const cursor = new Date(start);
  while (cursor < endExclusive) {
    total += dailyVolumes.get(dayKey(cursor)) ?? 0;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return total;
}

export async function getStreakAndWeekVolume(
  userId: string,
  now: Date
): Promise<{ streak: number; thisWeekVolume: number }> {
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setUTCDate(now.getUTCDate() - 89);
  ninetyDaysAgo.setUTCHours(0, 0, 0, 0);

  const logs = await prisma.workoutLog.findMany({
    where: { userId, date: { gte: ninetyDaysAgo } },
    select: { date: true, weight: true, sets: true, reps: true },
  });

  const dailyVolumes = computeDailyVolumes(logs);
  const streak = computeStreak(dailyVolumes, now);

  const thisWeekStart = getWeekStart(now);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
  const thisWeekVolume = sumVolumeInRange(dailyVolumes, thisWeekStart, nextWeekStart);

  return { streak, thisWeekVolume };
}

export type HeatmapDay = { date: Date; dateKey: string; volume: number; level: 0 | 1 | 2 | 3 | 4 };

export function buildHeatmapGrid(dailyVolumes: Map<string, number>, today: Date): HeatmapDay[][] {
  const totalDays = 84;
  const end = new Date(today);
  end.setUTCHours(0, 0, 0, 0);
  const endDow = end.getUTCDay();
  const gridEnd = new Date(end);
  gridEnd.setUTCDate(end.getUTCDate() + (6 - endDow));
  const gridStart = new Date(gridEnd);
  gridStart.setUTCDate(gridEnd.getUTCDate() - (totalDays - 1));

  const maxVolume = Math.max(1, ...dailyVolumes.values());

  const columns: HeatmapDay[][] = [];
  for (let col = 0; col < totalDays / 7; col++) {
    const column: HeatmapDay[] = [];
    for (let row = 0; row < 7; row++) {
      const date = new Date(gridStart);
      date.setUTCDate(gridStart.getUTCDate() + col * 7 + row);
      const dateKey = dayKey(date);
      const volume = dailyVolumes.get(dateKey) ?? 0;
      const ratio = volume / maxVolume;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (volume > 0) {
        if (ratio > 0.75) level = 4;
        else if (ratio > 0.5) level = 3;
        else if (ratio > 0.25) level = 2;
        else level = 1;
      }
      column.push({ date, dateKey, volume, level });
    }
    columns.push(column);
  }
  return columns;
}
