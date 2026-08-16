import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import ExercisePicker from "@/components/ExercisePicker";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const user = await getUser();
  const userId = user.id;

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
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <AppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="pt-8 pb-4">
            <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              Exercise Library
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              Pick Exercise
            </h1>
          </div>

          <ExercisePicker exercises={exercises} prByExercise={prByExercise} currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}
