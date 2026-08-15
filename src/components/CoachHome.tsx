import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { logout } from "@/app/actions";
import { getStreakAndWeekVolume } from "@/lib/stats";
import { dayLabels, getTodayDayOfWeek } from "@/lib/days";
import InviteAthleteForm from "@/app/coach/InviteAthleteForm";
import RequestRow from "@/app/coach/RequestRow";
import type { CoachProfile } from "@/generated/prisma/client";

function daysLeft(trialEndsAt: Date | null): number | null {
  if (!trialEndsAt) return null;
  const ms = trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export default async function CoachHome({
  user,
  profile,
}: {
  user: { id: string; name: string | null };
  profile: CoachProfile;
}) {
  const today = getTodayDayOfWeek();
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const [roster, pendingRequests, sentInvites] = await Promise.all([
    prisma.coachAthlete.findMany({
      where: { coachId: profile.userId, status: "ACCEPTED" },
      include: { athlete: { select: { id: true, name: true, email: true } } },
      orderBy: { respondedAt: "desc" },
    }),
    prisma.coachAthlete.findMany({
      where: { coachId: profile.userId, status: "PENDING", source: "DIRECTORY_REQUEST" },
      include: { athlete: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coachInvite.findMany({
      where: { coachId: profile.userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const streaks = await Promise.all(
    roster.map((link) => getStreakAndWeekVolume(link.athleteId, now))
  );
  const activeToday = streaks.filter((s) => s.streak > 0).length;
  const trialDaysLeft = daysLeft(profile.trialEndsAt);

  return (
    <div className="relative min-h-screen w-full flex-1">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src="/backgrounds/gym-side.jpg"
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
        <header className="flex items-start justify-between border-b border-border/70 px-4 pt-6 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-blue/40 bg-accent-blue-soft px-3 py-1 text-[11px] font-semibold tracking-wide text-accent-blue uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
              {dayLabels[today]} &middot; {todayLabel}
            </span>
            <h1 className="mt-3 font-display text-[36px] leading-[0.95] tracking-wide text-text uppercase">
              Coach Dashboard,
              <br />
              <span className="text-accent-blue">{(user.name ?? "Coach").split(" ")[0]}</span>
            </h1>
            {profile.subscriptionStatus === "TRIALING" && trialDaysLeft !== null && (
              <p className="mt-2 text-[12px] text-muted">
                Free trial &middot; {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left
              </p>
            )}
          </div>
          <div className="mt-1 flex flex-col items-end gap-1.5">
            <Link
              href="/exercises"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
            >
              Exercise Library
            </Link>
            <Link
              href="/program"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
            >
              My Programs
            </Link>
            <Link
              href="/history"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
            >
              History
            </Link>
            <Link
              href="/stats"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
            >
              Stats
            </Link>
            <Link
              href="/coach/profile"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
            >
              Coach Profile
            </Link>
            <Link
              href="/profile"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
            >
              {user.name}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent-blue hover:underline"
              >
                Log Out
              </button>
            </form>
          </div>
        </header>

        <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                Athletes
              </p>
              <p className="font-display text-[24px] leading-none text-text tabular-nums">
                {roster.length}
              </p>
              <p className="mt-1 text-[12px] text-accent-blue">
                {activeToday} active this week
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                Requests
              </p>
              <p className="font-display text-[24px] leading-none text-text tabular-nums">
                {pendingRequests.length}
              </p>
              <p className="mt-1 text-[12px] text-accent-blue">pending</p>
            </div>
          </div>

          {pendingRequests.length > 0 && (
            <section className="card-shine rounded-2xl p-6">
              <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
                Requests
              </h2>
              <div className="relative z-10 flex flex-col gap-2">
                {pendingRequests.map((r) => (
                  <RequestRow key={r.id} athleteId={r.athleteId} name={r.athlete.name ?? "Athlete"} />
                ))}
              </div>
            </section>
          )}

          <section className="card-shine rounded-2xl p-6">
            <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
              Your Athletes
            </h2>
            {roster.length === 0 ? (
              <p className="relative z-10 text-[13px] text-muted">
                No athletes yet — invite one by email or share your join code from your coach
                profile.
              </p>
            ) : (
              <div className="relative z-10 flex flex-col gap-2">
                {roster.map((link, i) => (
                  <Link
                    key={link.id}
                    href={`/coach/athletes/${link.athleteId}`}
                    className="card-shine card-pattern flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                  >
                    <span className="relative z-10">
                      <p className="text-[14.5px] font-semibold text-text">
                        {link.athlete.name ?? link.athlete.email}
                      </p>
                      <p className="text-[11.5px] text-muted">
                        {streaks[i].streak > 0
                          ? `${streaks[i].streak} day streak`
                          : "No recent activity"}
                      </p>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="card-shine rounded-2xl p-6">
            <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
              Invite an Athlete
            </h2>
            <InviteAthleteForm />
            {sentInvites.length > 0 && (
              <div className="relative z-10 mt-4 flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Pending Invites
                </p>
                {sentInvites.map((invite) => (
                  <p key={invite.id} className="text-[13px] text-muted">
                    {invite.email}
                  </p>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
