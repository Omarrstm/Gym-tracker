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
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-20 blur-[110px]"
        style={{ background: "var(--color-accent)", animation: "glow-flare 1.1s ease-out" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 sm:px-6">
        <header className="flex items-center justify-between border-b border-border/70 py-5">
          <Link href="/" className="font-display text-[20px] tracking-[0.12em] text-text uppercase">
            Gym Tracker
          </Link>
          <Link
            href="/"
            className="text-[12px] font-semibold tracking-wide text-muted hover:text-accent"
          >
            Exit Workout
          </Link>
        </header>

        <div
          className="pt-10 pb-6 text-center"
          style={{ animation: "fade-slide-up 0.5s ease-out both" }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Workout Mode &middot; {dayLabels[today]} &middot; {todayLabel}
          </span>
          <h1 className="mt-3 font-display text-[36px] leading-[0.95] tracking-wide text-text uppercase">
            {programDay?.label || "Today’s Workout"}
          </h1>
        </div>

        <TodayWorkout
          items={items}
          hasProgram={program !== null}
          dayNote={programDay?.notes ?? null}
          restTimerSeconds={user.restTimerSeconds}
        />
      </div>
    </div>
  );
}
