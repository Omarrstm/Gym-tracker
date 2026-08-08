import prisma from "@/lib/prisma";
import ExercisePicker from "@/components/ExercisePicker";

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    select: { id: true, name: true, muscleGroup: true, imageUrl: true, description: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="border-b border-border px-4 pt-6 pb-4">
        <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Exercise Library
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          Pick Exercise
        </h1>
      </header>
      <ExercisePicker exercises={exercises} />
    </div>
  );
}
