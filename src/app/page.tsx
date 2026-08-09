import Link from "next/link";
import prisma from "@/lib/prisma";
import { getDevUserId } from "@/lib/devUser";
import { dayLabels, getTodayDayOfWeek } from "@/lib/days";
import TodayWorkout from "@/components/TodayWorkout";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getDevUserId();
  const today = getTodayDayOfWeek();
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const program = await prisma.program.findFirst({
    where: { userId, isActive: true },
  });

  const programDay = program
    ? await prisma.programDay.findUnique({
        where: { programId_dayOfWeek: { programId: program.id, dayOfWeek: today } },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: {
                select: { id: true, name: true, muscleGroup: true, imageUrl: true },
              },
            },
          },
        },
      })
    : null;

  const exerciseIds = programDay?.exercises.map((pe) => pe.exercise.id) ?? [];

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todaysLogs =
    exerciseIds.length > 0
      ? await prisma.workoutLog.findMany({
          where: {
            userId,
            exerciseId: { in: exerciseIds },
            date: { gte: startOfDay, lt: endOfDay },
          },
        })
      : [];

  const items =
    programDay?.exercises.map((pe) => ({
      id: pe.id,
      exercise: pe.exercise,
      targetWeight: pe.targetWeight,
      targetSets: pe.targetSets,
      targetReps: pe.targetReps,
      loggedCount: todaysLogs.filter((log) => log.exerciseId === pe.exercise.id).length,
    })) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="flex items-start justify-between border-b border-border px-4 pt-6 pb-4">
        <div>
          <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
            {dayLabels[today]} &middot; {todayLabel}
          </p>
          <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
            Today&rsquo;s Workout
          </h1>
        </div>
        <Link
          href="/exercises"
          className="mt-1 text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          Exercise Library
        </Link>
      </header>

      <TodayWorkout items={items} hasProgram={program !== null} />
    </div>
  );
}
