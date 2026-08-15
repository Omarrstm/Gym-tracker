import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { exerciseId } = await params;
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true, name: true, muscleGroup: true },
  });
  if (!exercise) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id, exerciseId },
    orderBy: { date: "asc" },
  });

  const workingLogs = logs.filter((l) => !l.isWarmup);
  const prWeight = workingLogs.length > 0 ? Math.max(...workingLogs.map((l) => l.weight)) : null;
  const prLog = prWeight !== null ? workingLogs.find((l) => l.weight === prWeight)! : null;

  const sessions: { key: string; date: Date; logs: typeof logs; volume: number }[] = [];
  for (const log of logs) {
    const key = dayKey(log.date);
    const session = sessions[sessions.length - 1]?.key === key ? sessions[sessions.length - 1] : null;
    const volume = log.isWarmup ? 0 : log.weight * log.sets * log.reps;
    if (session) {
      session.logs.push(log);
      session.volume += volume;
    } else {
      sessions.push({ key, date: log.date, logs: [log], volume });
    }
  }

  const sessionsWithTrend = [...sessions].reverse().map((session, i) => {
    const previous = sessions[sessions.length - 1 - i - 1];
    const delta =
      previous && previous.volume > 0
        ? ((session.volume - previous.volume) / previous.volume) * 100
        : null;
    const trend = delta === null ? null : delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";

    return {
      key: session.key,
      date: session.date,
      volume: session.volume,
      trend,
      delta,
      logs: [...session.logs].reverse().map((log) => ({
        id: log.id,
        weight: log.weight,
        sets: log.sets,
        reps: log.reps,
        rir: log.rir,
        notes: log.notes,
        isWarmup: log.isWarmup,
        date: log.date,
        isPR: prLog !== null && log.id === prLog.id,
      })),
    };
  });

  return NextResponse.json({
    exercise,
    prWeight,
    prDate: prLog?.date ?? null,
    sessions: sessionsWithTrend,
  });
}
