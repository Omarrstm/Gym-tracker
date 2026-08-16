import "server-only";
import prisma from "@/lib/prisma";
import { getTodayDayOfWeek } from "@/lib/days";

export async function getTodaysWorkout(userId: string) {
  const today = getTodayDayOfWeek();

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
    programDay?.exercises.map((pe) => {
      const exerciseLogs = todaysLogs.filter((log) => log.exerciseId === pe.exercise.id);
      const workingSetsLoggedToday = exerciseLogs
        .filter((log) => !log.isWarmup)
        .reduce((sum, log) => sum + log.sets, 0);

      return {
        id: pe.id,
        exercise: pe.exercise,
        targetWeight: pe.targetWeight,
        targetSets: pe.targetSets,
        targetReps: pe.targetReps,
        loggedCount: exerciseLogs.length,
        workingSetsLoggedToday,
      };
    }) ?? [];

  return { today, program, programDay, items };
}
