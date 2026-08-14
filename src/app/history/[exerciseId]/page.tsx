import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import Exercise1RMChart from "@/components/Exercise1RMChart";
import SessionRow from "@/components/SessionRow";

export const dynamic = "force-dynamic";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ExerciseHistoryPage(props: PageProps<"/history/[exerciseId]">) {
  const { exerciseId } = await props.params;
  const { userId } = await verifySession();

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true, name: true, muscleGroup: true },
  });
  if (!exercise) notFound();

  const logs = await prisma.workoutLog.findMany({
    where: { userId, exerciseId },
    orderBy: { date: "asc" },
  });

  const workingLogs = logs.filter((l) => !l.isWarmup);
  const prWeight = workingLogs.length > 0 ? Math.max(...workingLogs.map((l) => l.weight)) : null;
  const prLog = prWeight !== null ? workingLogs.find((l) => l.weight === prWeight)! : null;

  const sessions: { key: string; date: Date; logs: typeof logs; volume: number }[] = [];
  for (const log of logs) {
    const key = dayKey(log.date);
    const session = sessions[sessions.length - 1]?.key === key ? sessions[sessions.length - 1] : null;
    const volume = log.isWarmup ? 0 : log.weight * log.sets * log.reps;
    if (session) {
      session.logs.push(log);
      session.volume += volume;
    } else {
      sessions.push({ key, date: log.date, logs: [log], volume });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="border-b border-border px-4 pt-6 pb-4">
        <Link
          href="/history"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; History
        </Link>
        <p className="mt-2 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          {muscleGroupLabels[exercise.muscleGroup]}
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          {exercise.name}
        </h1>
      </header>

      {logs.length === 0 ? (
        <p className="px-4 py-16 text-center text-[14px] text-muted">
          No sets logged for this exercise yet.
        </p>
      ) : (
        <>
          <div className="mx-4 mt-4 flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                Personal Record
              </p>
              <p className="font-display text-[26px] leading-none text-text tabular-nums">
                {prWeight !== null ? `${prWeight} kg` : "—"}
              </p>
            </div>
            {prLog && (
              <p className="text-[12px] text-muted">
                {prLog.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          <div className="mx-4 mt-5">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Estimated 1RM
            </p>
            <Exercise1RMChart
              logs={workingLogs.map((l) => ({
                date: l.date.toISOString(),
                weight: l.weight,
                reps: l.reps,
              }))}
            />
          </div>

          <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
            <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              All Sessions
            </p>
            {[...sessions].reverse().map((session, i) => {
              const previous = sessions[sessions.length - 1 - i - 1];
              const delta =
                previous && previous.volume > 0
                  ? ((session.volume - previous.volume) / previous.volume) * 100
                  : null;
              const trend = delta === null ? null : delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";

              return (
                <div key={session.key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted">
                      {session.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted">
                        Vol {Math.round(session.volume).toLocaleString("en-US")} kg
                      </span>
                      {trend && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                            trend === "up"
                              ? "border-accent bg-accent-soft text-accent"
                              : trend === "down"
                                ? "border-red-400/40 bg-red-400/10 text-red-400"
                                : "border-border bg-surface-2 text-muted"
                          }`}
                        >
                          {trend === "up"
                            ? `Progressed +${delta!.toFixed(0)}%`
                            : trend === "down"
                              ? `Regressed ${delta!.toFixed(0)}%`
                              : "Same"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[...session.logs].reverse().map((log) => (
                      <SessionRow
                        key={log.id}
                        log={{
                          id: log.id,
                          weight: log.weight,
                          sets: log.sets,
                          reps: log.reps,
                          rir: log.rir,
                          notes: log.notes,
                          isWarmup: log.isWarmup,
                          date: log.date.toISOString(),
                        }}
                        isPR={prLog !== null && log.id === prLog.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
