import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { requireCoachProfile } from "@/lib/coachDal";
import { getTodaysWorkout } from "@/lib/todayWorkout";
import { getStreakAndWeekVolume, formatVolume } from "@/lib/stats";
import { dayLabels } from "@/lib/days";
import { muscleGroupLabels } from "@/lib/muscleGroups";
import { CreateOrAssignForm, UnassignButton } from "./AthleteProgramActions";
import RevokeLinkButton from "@/components/RevokeLinkButton";
import CoachAppHeader from "@/components/CoachAppHeader";
import { FlameIcon, TrendingUpIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const { athleteId } = await params;
  const profile = await requireCoachProfile();
  const coachId = profile.userId;
  const user = await getUser();

  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId, athleteId } },
  });
  if (!link || link.status !== "ACCEPTED") notFound();

  const athlete = await prisma.user.findUnique({
    where: { id: athleteId },
    select: { id: true, name: true, email: true },
  });
  if (!athlete) notFound();

  const now = new Date();
  const [{ today, items }, { streak, thisWeekVolume }, programs, templates, logs] =
    await Promise.all([
      getTodaysWorkout(athleteId),
      getStreakAndWeekVolume(athleteId, now),
      prisma.program.findMany({
        where: { userId: athleteId },
        orderBy: { createdAt: "asc" },
        include: { days: { include: { _count: { select: { exercises: true } } } } },
      }),
      prisma.program.findMany({
        where: { userId: coachId },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.workoutLog.findMany({
        where: { userId: athleteId, isWarmup: false },
        orderBy: { date: "asc" },
        include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
      }),
    ]);

  const prByExercise = new Map<
    string,
    { name: string; muscleGroup: (typeof logs)[number]["exercise"]["muscleGroup"]; weight: number }
  >();
  for (const log of logs) {
    const existing = prByExercise.get(log.exerciseId);
    if (!existing || log.weight > existing.weight) {
      prByExercise.set(log.exerciseId, {
        name: log.exercise.name,
        muscleGroup: log.exercise.muscleGroup,
        weight: log.weight,
      });
    }
  }
  const prs = [...prByExercise.values()].sort((a, b) => b.weight - a.weight).slice(0, 5);

  return (
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent-blue)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <CoachAppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
      <header className="mb-5">
        <Link
          href="/coach"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
        >
          &larr; Dashboard
        </Link>
        <p className="mt-3 font-display text-[13px] tracking-[0.12em] text-accent-blue uppercase">
          Athlete
        </p>
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
            {athlete.name ?? athlete.email}
          </h1>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card-shine rounded-xl px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue-soft text-accent-blue">
              <FlameIcon />
            </div>
            <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">Streak</p>
            <p className="font-display text-[24px] leading-none text-text tabular-nums">{streak}</p>
            <p className="mt-1 text-[12px] text-accent-blue">{streak === 1 ? "day" : "days"}</p>
          </div>
          <div className="card-shine rounded-xl px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue-soft text-accent-blue">
              <TrendingUpIcon />
            </div>
            <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">This Week</p>
            <p className="font-display text-[24px] leading-none text-text tabular-nums">
              {formatVolume(thisWeekVolume)}
            </p>
            <p className="mt-1 text-[12px] text-accent-blue">volume lifted</p>
          </div>
        </div>

        <Link
          href={`/coach/athletes/${athleteId}/messages`}
          className="card-shine rounded-2xl p-4 text-center font-display text-[13px] tracking-wide text-accent uppercase"
        >
          Message {athlete.name ?? "Athlete"}
        </Link>

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Today &mdash; {dayLabels[today]}
          </h2>
          {items.length === 0 ? (
            <p className="relative z-10 text-[13px] text-muted">No exercises scheduled today.</p>
          ) : (
            <div className="relative z-10 flex flex-col gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card-shine flex items-center justify-between rounded-lg px-3.5 py-2.5"
                >
                  <span className="relative z-10 text-[13.5px] font-semibold text-text">{item.exercise.name}</span>
                  <span className="relative z-10 text-[12px] text-muted">
                    {item.loggedCount > 0 ? `${item.loggedCount} logged` : "not logged"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {prs.length > 0 && (
          <section className="card-shine rounded-2xl p-6">
            <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
              Top PRs
            </h2>
            <div className="relative z-10 flex flex-col gap-2">
              {prs.map((pr) => (
                <div key={pr.name} className="flex items-center justify-between">
                  <span className="text-[13.5px] text-text">{pr.name}</span>
                  <span className="text-[12px] text-muted">
                    {pr.weight} kg &middot; {muscleGroupLabels[pr.muscleGroup]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Programs
          </h2>
          <div className="relative z-10 flex flex-col gap-2">
            {programs.map((p) => (
              <div key={p.id} className="card-shine rounded-xl px-4 py-3">
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <Link href={`/program/${p.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14.5px] font-semibold text-text">{p.name}</p>
                      {p.isActive && (
                        <span className="shrink-0 rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {p.days.length} {p.days.length === 1 ? "day" : "days"} &middot;{" "}
                      {p.days.reduce((sum, d) => sum + d._count.exercises, 0)} exercises
                    </p>
                  </Link>
                  {p.assignedByCoachId === coachId && <UnassignButton programId={p.id} />}
                </div>
              </div>
            ))}
            {programs.length === 0 && (
              <p className="text-[13px] text-muted">No programs yet.</p>
            )}
          </div>

          <div className="relative z-10 mt-4 border-t border-border pt-4">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Assign a Program
            </p>
            <CreateOrAssignForm athleteId={athleteId} templates={templates} />
          </div>
        </section>

        <div className="flex justify-end">
          <RevokeLinkButton counterpartUserId={athleteId} redirectTo="/coach" label="Remove Athlete" />
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
