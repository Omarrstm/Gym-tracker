import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import AppHeader from "@/components/AppHeader";
import SubTabs from "@/components/SubTabs";

export const dynamic = "force-dynamic";

const progressTabs = [
  { href: "/stats", label: "Overview" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Exercises" },
];

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ProgressPage() {
  const user = await getUser();

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id, isWarmup: false },
    orderBy: { date: "asc" },
    include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
  });

  const byExercise = new Map<
    string,
    { name: string; muscleGroup: (typeof logs)[number]["exercise"]["muscleGroup"]; days: Set<string>; lastDate: Date }
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
              Exercises
            </h1>
            <p className="mt-2 text-[13px] text-muted">
              Pick an exercise to see how the weight you&rsquo;re lifting has moved between
              workouts.
            </p>
          </div>

          <div className="pb-4">
            <SubTabs tabs={progressTabs} />
          </div>

          {exercises.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-[14px] text-muted">
                No exercises logged yet &mdash; log a few sets to start tracking progress.
              </p>
              <Link
                href="/exercises"
                className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold tracking-wide text-bg uppercase"
              >
                Browse Exercises
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-6">
              {exercises.map((ex) => (
                <Link
                  key={ex.exerciseId}
                  href={`/progress/${ex.exerciseId}`}
                  className="card-shine flex items-center justify-between rounded-xl px-3.5 py-3"
                >
                  <span className="relative z-10 min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-text">{ex.name}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted">
                      {muscleGroupLabels[ex.muscleGroup]}
                    </p>
                  </span>
                  <span className="relative z-10 shrink-0 text-right">
                    <p className="text-[13px] font-semibold text-text tabular-nums">
                      {ex.sessionCount} {ex.sessionCount === 1 ? "workout" : "workouts"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      Last {ex.lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
