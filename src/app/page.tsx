import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/dal";
import { getCoachProfile } from "@/lib/coachDal";
import { logout } from "@/app/actions";
import { dayLabels } from "@/lib/days";
import { getTodaysWorkout } from "@/lib/todayWorkout";
import { formatVolume, getStreakAndWeekVolume } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  const userId = user.id;
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const { today, program, programDay, items } = await getTodaysWorkout(userId);
  const { streak, thisWeekVolume } = await getStreakAndWeekVolume(userId, new Date());
  const coachProfile = await getCoachProfile(userId);

  const loggedCount = items.filter((item) => item.loggedCount > 0).length;

  return (
    <div className="relative min-h-screen w-full flex-1">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src="/backgrounds/gym-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="scale-105 object-cover object-top blur-[2px]"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(22,21,26,0.6) 0%, rgba(22,21,26,0.8) 35%, var(--color-bg) 62%)",
          }}
        />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-start justify-between border-b border-border/70 px-4 pt-6 pb-4">
          <div>
            <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              {dayLabels[today]} &middot; {todayLabel}
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              Overview
            </h1>
          </div>
          <div className="mt-1 flex flex-col items-end gap-1.5">
            <Link
              href="/exercises"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              Exercise Library
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
            <Link
              href="/coaches"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              Coaches
            </Link>
            <Link
              href="/coaches/mine"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              My Coach
            </Link>
            <Link
              href={coachProfile ? "/coach" : "/coach/profile"}
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              {coachProfile ? "Coach Dashboard" : "Become a Coach"}
            </Link>
            <Link
              href="/profile"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              {user.name}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
              >
                Log Out
              </button>
            </form>
          </div>
        </header>

        <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
          {program && items.length > 0 && (
            <Link
              href="/workout"
              className="flex items-center justify-between rounded-2xl bg-accent px-5 py-4 text-bg shadow-lg"
            >
              <span>
                <p className="text-[11px] font-bold tracking-wide uppercase opacity-70">
                  {items.length} {items.length === 1 ? "exercise" : "exercises"} &middot;{" "}
                  {loggedCount}/{items.length} logged
                </p>
                <p className="font-display text-[22px] leading-none tracking-wide uppercase">
                  Start Your {programDay?.label || `${dayLabels[today]} Workout`}
                </p>
              </span>
              <span className="font-display text-[22px]">&rarr;</span>
            </Link>
          )}

          {program && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border px-5 py-4">
              {programDay?.notes && (
                <p className="mb-2 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-[13px] leading-relaxed text-accent">
                  {programDay.notes}
                </p>
              )}
              <p className="text-[13px] text-muted">
                Rest day &mdash; nothing scheduled for today.
              </p>
              <Link
                href="/exercises"
                className="mt-1 inline-block text-[13px] font-semibold text-accent underline-offset-2 hover:underline"
              >
                Log something anyway
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                Streak
              </p>
              <p className="font-display text-[24px] leading-none text-text tabular-nums">
                {streak}
              </p>
              <p className="mt-1 text-[12px] text-accent">{streak === 1 ? "day" : "days"}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                This Week
              </p>
              <p className="font-display text-[24px] leading-none text-text tabular-nums">
                {formatVolume(thisWeekVolume)}
              </p>
              <p className="mt-1 text-[12px] text-accent">volume lifted</p>
            </div>
          </div>

          {program ? (
            <Link
              href={`/program/${program.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
            >
              <span>
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Active Program
                </p>
                <p className="text-[14px] font-semibold text-text">{program.name}</p>
              </span>
              <span className="text-[12px] font-semibold text-accent">View &rarr;</span>
            </Link>
          ) : (
            <Link
              href="/program"
              className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3"
            >
              <span className="text-[13px] text-muted">No active program yet</span>
              <span className="text-[12px] font-semibold text-accent">Create one &rarr;</span>
            </Link>
          )}

          {!program && (
            <p className="px-1 text-[13px] text-muted">
              Once you build a program, your daily workout will show up here.{" "}
              <Link href="/exercises" className="font-semibold text-accent hover:underline">
                Browse exercises
              </Link>{" "}
              to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
