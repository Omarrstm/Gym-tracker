import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { dayLabels, dayOrder } from "@/lib/days";
import ProgramDayCard from "@/components/ProgramDayCard";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage(props: PageProps<"/program/[id]">) {
  const { id } = await props.params;
  const { userId } = await verifySession();

  const program = await prisma.program.findFirst({ where: { id, userId } });
  if (!program) notFound();

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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="border-b border-border px-4 pt-6 pb-4">
        <Link
          href="/program"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Programs
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
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
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
  );
}
