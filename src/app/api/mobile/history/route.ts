import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobileAuth";

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

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
  });

  const groups: {
    label: string;
    logs: {
      id: string;
      weight: number;
      sets: number;
      reps: number;
      isWarmup: boolean;
      exercise: { id: string; name: string; muscleGroup: string };
    }[];
  }[] = [];

  for (const log of logs) {
    const label = dayLabel(log.date);
    const group = groups.find((g) => g.label === label);
    const entry = {
      id: log.id,
      weight: log.weight,
      sets: log.sets,
      reps: log.reps,
      isWarmup: log.isWarmup,
      exercise: log.exercise,
    };
    if (group) group.logs.push(entry);
    else groups.push({ label, logs: [entry] });
  }

  return NextResponse.json({ groups });
}
