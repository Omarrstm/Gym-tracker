import Link from "next/link";
import { getOptionalUser } from "@/lib/dal";
import { getCoachProfile } from "@/lib/coachDal";
import { logout } from "@/app/actions";
import { dayLabels } from "@/lib/days";
import { getTodaysWorkout } from "@/lib/todayWorkout";
import { formatVolume, getStreakAndWeekVolume } from "@/lib/stats";
import LandingPage from "@/components/LandingPage";
import CoachHome from "@/components/CoachHome";

export const dynamic = "force-dynamic";

function FlameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c1 3-2 4.5-2 7.5a4 4 0 0 0 8 0c0-1.5-.5-2.5-1-3.5.5 3-1 4-2 4-1.5 0-2-1.5-1-3C15 5 13.5 3 12 2z" />
      <path d="M8.5 12.5A5.5 5.5 0 0 0 12 22a5.5 5.5 0 0 0 3.5-9.7" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export default async function Home() {
  const user = await getOptionalUser();
  if (!user) {
    return <LandingPage />;
  }
  const userId = user.id;

  const coachProfile = await getCoachProfile(userId);
  if (coachProfile) {
    return <CoachHome user={user} profile={coachProfile} />;
  }

  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const { today, program, programDay, items } = await getTodaysWorkout(userId);
  const { streak, thisWeekVolume } = await getStreakAndWeekVolume(userId, new Date());

  const loggedCount = items.filter((item) => item.loggedCount > 0).length;

  return (
    <div className="relative min-h-screen w-full flex-1">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-border/70 py-5 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="font-display text-[20px] tracking-[0.12em] text-text uppercase">
            Gym Tracker
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/exercises"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              Exercise Library
            </Link>
            <Link
              href="/program"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              Programs
            </Link>
            <Link
              href="/history"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              History
            </Link>
            <Link
              href="/stats"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              Stats
            </Link>
            <Link
              href="/coaches"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              Coaches
            </Link>
            <Link
              href="/coaches/mine"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              My Coach
            </Link>
            <Link
              href="/coach/profile"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              Become a Coach
            </Link>
            <Link
              href="/profile"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              {user.name}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
              >
                Log Out
              </button>
            </form>
          </nav>
        </header>

        <section className="pt-10 pb-8 lg:pt-14 lg:pb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {dayLabels[today]} &middot; {todayLabel}
          </span>
          <h1 className="mt-3 font-display text-[36px] leading-[0.95] tracking-wide text-text uppercase lg:text-[48px]">
            Welcome back, <span className="text-accent">{(user.name ?? "there").split(" ")[0]}</span>
          </h1>
        </section>

        <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-3 lg:gap-6 lg:pb-16">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {program && items.length > 0 && (
              <Link
                href="/workout"
                className="flex items-center justify-between rounded-2xl bg-accent px-6 py-6 text-bg shadow-lg lg:px-8"
              >
                <span>
                  <p className="text-[11px] font-bold tracking-wide uppercase opacity-70">
                    {items.length} {items.length === 1 ? "exercise" : "exercises"} &middot;{" "}
                    {loggedCount}/{items.length} logged
                  </p>
                  <p className="font-display text-[24px] leading-none tracking-wide uppercase lg:text-[28px]">
                    Start Your {programDay?.label || `${dayLabels[today]} Workout`}
                  </p>
                </span>
                <span className="font-display text-[26px]">&rarr;</span>
              </Link>
            )}

            {program && items.length === 0 && (
              <div className="flex flex-1 flex-col justify-center rounded-2xl border border-dashed border-border px-6 py-8 lg:px-8">
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

            {!program && (
              <div className="flex flex-1 flex-col justify-center rounded-2xl border border-dashed border-border px-6 py-8 text-center lg:px-8">
                <p className="text-[13px] text-muted">
                  Once you build a program, your daily workout will show up here.
                </p>
                <Link
                  href="/exercises"
                  className="mt-1 inline-block text-[13px] font-semibold text-accent underline-offset-2 hover:underline"
                >
                  Browse exercises to get started
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-shine rounded-xl px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
                  <FlameIcon />
                </div>
                <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Streak
                </p>
                <p className="font-display text-[24px] leading-none text-text tabular-nums">
                  {streak}
                </p>
                <p className="mt-1 text-[12px] text-accent">{streak === 1 ? "day" : "days"}</p>
              </div>
              <div className="card-shine rounded-xl px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
                  <TrendingUpIcon />
                </div>
                <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  This Week
                </p>
                <p className="font-display text-[24px] leading-none text-text tabular-nums">
                  {formatVolume(thisWeekVolume)}
                </p>
                <p className="mt-1 text-[12px] text-accent">volume lifted</p>
              </div>
            </div>

            {program ? (
              <Link href={`/program/${program.id}`} className="card-shine flex items-center justify-between rounded-xl px-4 py-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft text-accent">
                    <CalendarIcon />
                  </span>
                  <span>
                    <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                      Active Program
                    </p>
                    <p className="text-[14px] font-semibold text-text">{program.name}</p>
                  </span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
