import Link from "next/link";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import ExercisePicker from "@/components/ExercisePicker";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const { userId } = await verifySession();

  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ createdByUserId: null }, { createdByUserId: userId }] },
    select: {
      id: true,
      name: true,
      muscleGroup: true,
      imageUrl: true,
      description: true,
      createdByUserId: true,
    },
    orderBy: { name: "asc" },
  });

  const prs = await prisma.workoutLog.groupBy({
    by: ["exerciseId"],
    where: { userId, isWarmup: false },
    _max: { weight: true },
  });
  const prByExercise = Object.fromEntries(
    prs.map((p) => [p.exerciseId, p._max.weight as number])
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="flex items-start justify-between border-b border-border px-4 pt-6 pb-4">
        <div>
          <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
            Exercise Library
          </p>
          <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
            Pick Exercise
          </h1>
        </div>
        <div className="mt-1 flex flex-col items-end gap-1.5">
          <Link
            href="/"
            className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            Today
          </Link>
          <Link
            href="/program"
            className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            Programs
          </Link>
          <Link
            href="/history"
            className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            History
          </Link>
          <Link
            href="/stats"
            className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            Stats
          </Link>
        </div>
      </header>

      <ExercisePicker exercises={exercises} prByExercise={prByExercise} currentUserId={userId} />
    </div>
  );
}
