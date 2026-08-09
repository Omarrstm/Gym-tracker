import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import WeightTrendChart from "@/components/WeightTrendChart";
import SessionRow from "@/components/SessionRow";

export const dynamic = "force-dynamic";

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
          <div className="card-shine mx-4 mt-4 rounded-xl px-4 py-4">
            <WeightTrendChart data={logs.map((l) => ({ date: l.date.toISOString(), weight: l.weight }))} />
          </div>

          <div className="flex flex-col gap-2 px-4 pt-4 pb-6">
            <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              All Sessions
            </p>
            {[...logs].reverse().map((log) => (
              <SessionRow key={log.id} log={{ ...log, date: log.date.toISOString() }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
