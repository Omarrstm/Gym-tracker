import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { findViewableProgram } from "@/lib/coachDal";
import { dayLabels, dayOrder } from "@/lib/days";
import ProgramDayCard from "@/components/ProgramDayCard";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage(props: PageProps<"/program/[id]">) {
  const { id } = await props.params;
  const user = await getUser();
  const userId = user.id;

  const program = await findViewableProgram(id, userId);
  if (!program) notFound();

  const isCoachView = program.userId !== userId;
  const backHref = isCoachView ? `/coach/athletes/${program.userId}` : "/program";

  const days = await prisma.programDay.findMany({
    where: { programId: id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
      },
    },
  });

  const allExercises = await prisma.exercise.findMany({
    select: { id: true, name: true, muscleGroup: true },
    orderBy: { name: "asc" },
  });

  const exercisesByDay = new Map(days.map((d) => [d.dayOfWeek, d.exercises]));
  const notesByDay = new Map(days.map((d) => [d.dayOfWeek, d.notes]));
  const labelByDay = new Map(days.map((d) => [d.dayOfWeek, d.label]));

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
              href={backHref}
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              &larr; {isCoachView ? "Athlete" : "Programs"}
            </Link>
            <div className="mt-2 flex items-center gap-2">
              <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
                {program.name}
              </h1>
              {program.isActive && (
                <span className="rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
                  Active
                </span>
              )}
              {program.assignedByCoachId && (
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted uppercase">
                  Coach Assigned
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-6">
            {dayOrder.map((day) => (
              <ProgramDayCard
                key={day}
                programId={program.id}
                dayOfWeek={day}
                dayLabel={dayLabels[day]}
                label={labelByDay.get(day) ?? null}
                notes={notesByDay.get(day) ?? null}
                exercises={exercisesByDay.get(day) ?? []}
                allExercises={allExercises}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
