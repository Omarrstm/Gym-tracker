import Link from "next/link";
import prisma from "@/lib/prisma";
import { getDevUserId } from "@/lib/devUser";
import { muscleGroupLabels } from "@/lib/muscleGroups";

export const dynamic = "force-dynamic";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Today";
  if (dayKey(d) === dayKey(yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function HistoryPage() {
  const userId = await getDevUserId();
  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
  });

  const groups: { label: string; logs: typeof logs }[] = [];
  for (const log of logs) {
    const label = dayLabel(log.date);
    const group = groups.find((g) => g.label === label);
    if (group) {
      group.logs.push(log);
    } else {
      groups.push({ label, logs: [log] });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="flex items-start justify-between border-b border-border px-4 pt-6 pb-4">
        <div>
          <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
            Progress
          </p>
          <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
            History
          </h1>
        </div>
        <Link
          href="/"
          className="mt-1 text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          Today
        </Link>
      </header>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="text-[14px] text-muted">Nothing logged yet.</p>
          <Link
            href="/exercises"
            className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold tracking-wide text-bg uppercase"
          >
            Browse Exercises
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                {group.label}
              </p>
              <div className="flex flex-col gap-2">
                {group.logs.map((log) => (
                  <Link
                    key={log.id}
                    href={`/history/${log.exercise.id}`}
                    className="card-shine flex items-center justify-between rounded-xl px-3.5 py-3"
                  >
                    <span className="relative z-10">
                      <p className="text-[14.5px] font-semibold text-text">{log.exercise.name}</p>
                      <p className="text-[11px] uppercase tracking-wide text-muted">
                        {muscleGroupLabels[log.exercise.muscleGroup]}
                      </p>
                    </span>
                    <span className="relative z-10 text-[13px] text-muted">
                      {log.weight} kg &times; {log.sets} &times; {log.reps}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
