import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import HistoryLogRow from "@/components/HistoryLogRow";
import AppHeader from "@/components/AppHeader";

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
  const user = await getUser();
  const userId = user.id;
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
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <AppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="flex items-start justify-between pt-8 pb-4">
            <div>
              <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
                Progress
              </p>
              <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
                History
              </h1>
            </div>
            <Link
              href="/history/prs"
              className="mt-1 text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              All PRs
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-[14px] text-muted">Nothing logged yet.</p>
              <Link
                href="/exercises"
                className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold tracking-wide text-bg uppercase"
              >
                Browse Exercises
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-6">
              {groups.map((group) => (
                <div key={group.label} className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-2">
                    {group.logs.map((log) => (
                      <HistoryLogRow key={log.id} log={log} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
