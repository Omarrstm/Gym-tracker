import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobileAuth";
import { getTodaysWorkout } from "@/lib/todayWorkout";
import { getStreakAndWeekVolume } from "@/lib/stats";
import { dayLabels } from "@/lib/days";

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { today, program, programDay, items } = await getTodaysWorkout(user.id);
  const { streak, thisWeekVolume } = await getStreakAndWeekVolume(user.id, new Date());

  return NextResponse.json({
    today,
    todayLabel: dayLabels[today],
    streak,
    thisWeekVolume,
    program: program ? { id: program.id, name: program.name } : null,
    programDay: programDay
      ? { label: programDay.label, notes: programDay.notes }
      : null,
    items: items.map((item) => ({
      id: item.id,
      exercise: item.exercise,
      targetWeight: item.targetWeight,
      targetSets: item.targetSets,
      targetReps: item.targetReps,
      loggedCount: item.loggedCount,
      workingSetsLoggedToday: item.workingSetsLoggedToday,
    })),
  });
}
