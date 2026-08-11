import Link from "next/link";
import { getUser } from "@/lib/dal";
import { dayLabels } from "@/lib/days";
import { getTodaysWorkout } from "@/lib/todayWorkout";
import TodayWorkout from "@/components/TodayWorkout";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const user = await getUser();
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const { today, program, programDay, items } = await getTodaysWorkout(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="border-b border-border px-4 pt-6 pb-4">
        <Link
          href="/"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Home
        </Link>
        <p className="mt-2 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          {dayLabels[today]} &middot; {todayLabel}
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          {programDay?.label || "Today’s Workout"}
        </h1>
      </header>

      <TodayWorkout items={items} hasProgram={program !== null} dayNote={programDay?.notes ?? null} />
    </div>
  );
}
