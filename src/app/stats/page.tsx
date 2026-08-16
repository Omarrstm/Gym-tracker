import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import type { MuscleGroup } from "@/generated/prisma/client";
import {
  buildHeatmapGrid,
  computeDailyVolumes,
  computeStreak,
  formatVolume,
  getWeekStart,
  sumVolumeInRange,
} from "@/lib/stats";
import AppHeader from "@/components/AppHeader";
import SubTabs from "@/components/SubTabs";
import { FlameIcon, TrendingUpIcon } from "@/components/icons";

const progressTabs = [
  { href: "/stats", label: "Overview" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Exercises" },
];

export const dynamic = "force-dynamic";

const dayInitials = ["S", "M", "T", "W", "T", "F", "S"];

const levelClass: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-surface-2",
  1: "bg-accent/20",
  2: "bg-accent/40",
  3: "bg-accent/70",
  4: "bg-accent",
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDateKey(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${monthNames[month - 1]} ${day}`;
}

export default async function StatsPage() {
  const user = await getUser();
  const userId = user.id;

  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setUTCDate(today.getUTCDate() - 89);
  ninetyDaysAgo.setUTCHours(0, 0, 0, 0);

  const logs = await prisma.workoutLog.findMany({
    where: { userId, isWarmup: false, date: { gte: ninetyDaysAgo } },
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
  const weekDelta =
    lastWeekVolume > 0 ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 : null;

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
  const muscleGroupRanking = [...volumeByMuscleGroup.entries()].sort((a, b) => b[1] - a[1]);
  const maxMuscleGroupVolume = Math.max(1, ...muscleGroupRanking.map(([, v]) => v));

  const heatmap = buildHeatmapGrid(dailyVolumes, today);

  return (
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <AppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="pt-8 pb-4">
            <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              Progress
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              Overview
            </h1>
          </div>

          <div className="pb-4">
            <SubTabs tabs={progressTabs} />
          </div>

      <div className="flex flex-col gap-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="card-shine rounded-xl px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
              <FlameIcon />
            </div>
            <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">Streak</p>
            <p className="font-display text-[24px] leading-none text-text tabular-nums">
              {streak}
            </p>
            <p className="mt-1 text-[12px] text-accent">{streak === 1 ? "day" : "days"}</p>
          </div>
          <div className="card-shine rounded-xl px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
              <TrendingUpIcon />
            </div>
            <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
              This Week
            </p>
            <p className="font-display text-[24px] leading-none text-text tabular-nums">
              {formatVolume(thisWeekVolume)}
            </p>
            <p className="mt-1 text-[12px] text-accent">
              {weekDelta === null
                ? "volume lifted"
                : `${weekDelta >= 0 ? "+" : ""}${weekDelta.toFixed(0)}% vs last week`}
            </p>
          </div>
        </div>

        <section className="card-shine rounded-2xl p-5">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Consistency
          </h2>
          <div className="relative z-10 overflow-x-auto">
            <div className="flex w-max gap-[3px]">
              <div className="flex flex-col gap-[3px] pr-1">
                {dayInitials.map((initial, i) => (
                  <div
                    key={i}
                    className="flex h-[11px] w-[11px] items-center justify-center text-[9px] leading-none text-muted"
                  >
                    {i % 2 === 1 ? initial : ""}
                  </div>
                ))}
              </div>
              {heatmap.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-[3px]">
                  {column.map((day) => (
                    <div
                      key={day.dateKey}
                      title={`${formatDateKey(day.dateKey)} — ${
                        day.volume > 0 ? formatVolume(day.volume) : "no training"
                      }`}
                      className={`h-[11px] w-[11px] rounded-[2px] ${levelClass[day.level]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-3 flex items-center gap-1.5">
            <span className="text-[11px] text-muted">Less</span>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <div key={level} className={`h-[11px] w-[11px] rounded-[2px] ${levelClass[level]}`} />
            ))}
            <span className="text-[11px] text-muted">More</span>
          </div>
        </section>

        <section className="card-shine rounded-2xl p-5">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Volume by Muscle Group
          </h2>
          <p className="relative z-10 mb-4 text-[11px] text-muted">Last 30 days</p>

          {muscleGroupRanking.length === 0 ? (
            <p className="relative z-10 text-[13px] text-muted">
              Log some sets to see your training breakdown.
            </p>
          ) : (
            <div className="relative z-10 flex flex-col gap-3">
              {muscleGroupRanking.map(([mg, volume]) => (
                <div key={mg} className="flex items-center gap-3">
                  <span className="w-[76px] shrink-0 text-[12px] font-semibold tracking-wide text-muted uppercase">
                    {muscleGroupLabels[mg]}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(4, (volume / maxMuscleGroupVolume) * 100)}%` }}
                    />
                  </div>
                  <span className="w-[64px] shrink-0 text-right text-[12px] tabular-nums text-text">
                    {formatVolume(volume)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
        </div>
      </div>
    </div>
  );
}
