import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import ExerciseProgressChart from "@/components/ExerciseProgressChart";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ExerciseProgressPage(props: PageProps<"/progress/[exerciseId]">) {
  const { exerciseId } = await props.params;
  const user = await getUser();

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true, name: true, muscleGroup: true },
  });
  if (!exercise) notFound();

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id, exerciseId, isWarmup: false },
    orderBy: { date: "asc" },
  });

  type Session = { key: string; date: Date; weight: number; reps: number };
  const sessions: Session[] = [];
  for (const log of logs) {
    const key = dayKey(log.date);
    const existing = sessions[sessions.length - 1]?.key === key ? sessions[sessions.length - 1] : null;
    if (existing) {
      if (log.weight > existing.weight) {
        existing.weight = log.weight;
        existing.reps = log.reps;
      }
    } else {
      sessions.push({ key, date: log.date, weight: log.weight, reps: log.reps });
    }
  }

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
              href="/progress"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              &larr; Progress
            </Link>
            <p className="mt-2 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              {muscleGroupLabels[exercise.muscleGroup]}
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              {exercise.name}
            </h1>
          </div>

          {sessions.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-muted">
              No sets logged for this exercise yet.
            </p>
          ) : (
            <>
              <ExerciseProgressChart
                sessions={sessions.map((s) => ({
                  date: s.date.toISOString(),
                  weight: s.weight,
                  reps: s.reps,
                }))}
              />

              <div className="mt-6 flex flex-col gap-2 pb-6">
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Every Workout
                </p>
                {[...sessions].reverse().map((session, i) => {
                  const previous = sessions[sessions.length - 1 - i - 1];
                  const delta = previous ? session.weight - previous.weight : null;

                  return (
                    <div
                      key={session.key}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5"
                    >
                      <span className="text-[12.5px] text-muted">
                        {session.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-text tabular-nums">
                          {session.weight} kg &times; {session.reps}
                        </span>
                        {delta !== null && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                              delta > 0
                                ? "border-accent bg-accent-soft text-accent"
                                : delta < 0
                                  ? "border-red-400/40 bg-red-400/10 text-red-400"
                                  : "border-border bg-surface text-muted"
                            }`}
                          >
                            {delta > 0 ? `+${delta} kg` : delta < 0 ? `${delta} kg` : "Same"}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
