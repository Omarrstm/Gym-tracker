import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import type { MuscleGroup } from "@/generated/prisma/client";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

type PRRow = {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  date: Date;
};

export default async function AllPRsPage() {
  const user = await getUser();
  const userId = user.id;

  const logs = await prisma.workoutLog.findMany({
    where: { userId, isWarmup: false },
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
            <Link
              href="/history"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              &larr; History
            </Link>
            <p className="mt-2 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              Progress
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              All PRs
            </h1>
          </div>

          {prs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-[14px] text-muted">No personal records yet.</p>
              <Link
                href="/exercises"
                className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold tracking-wide text-bg uppercase"
              >
                Browse Exercises
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-6">
              {prs.map((pr) => (
                <Link
                  key={pr.exerciseId}
                  href={`/history/${pr.exerciseId}`}
                  className="card-shine flex items-center justify-between rounded-xl px-3.5 py-3"
                >
                  <span className="relative z-10 min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-text">{pr.name}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted">
                      {muscleGroupLabels[pr.muscleGroup]}
                    </p>
                  </span>
                  <span className="relative z-10 shrink-0 text-right">
                    <p className="font-display text-[20px] leading-none text-text tabular-nums">
                      {pr.weight} kg
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {pr.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
