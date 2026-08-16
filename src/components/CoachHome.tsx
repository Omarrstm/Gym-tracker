import Link from "next/link";
import prisma from "@/lib/prisma";
import { getStreakAndWeekVolume } from "@/lib/stats";
import { dayLabels, getTodayDayOfWeek } from "@/lib/days";
import InviteAthleteForm from "@/app/coach/InviteAthleteForm";
import RequestRow from "@/app/coach/RequestRow";
import CoachAppHeader from "@/components/CoachAppHeader";
import { InboxIcon, UsersIcon } from "@/components/icons";
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
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent-blue)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <CoachAppHeader userName={user.name} />

        <section className="pt-10 pb-8 lg:pt-14 lg:pb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-blue/40 bg-accent-blue-soft px-3 py-1 text-[11px] font-semibold tracking-wide text-accent-blue uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
            {dayLabels[today]} &middot; {todayLabel}
          </span>
          <h1 className="mt-3 font-display text-[36px] leading-[0.95] tracking-wide text-text uppercase lg:text-[48px]">
            Coach Dashboard, <span className="text-accent-blue">{(user.name ?? "Coach").split(" ")[0]}</span>
          </h1>
          {profile.subscriptionStatus === "TRIALING" && trialDaysLeft !== null && (
            <p className="mt-2 text-[12px] text-muted">
              Free trial &middot; {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left
            </p>
          )}
        </section>

        <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-3 lg:gap-6 lg:pb-16">
          <div className="flex flex-col gap-4 lg:col-span-2">
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
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-shine rounded-xl px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue-soft text-accent-blue">
                  <UsersIcon />
                </div>
                <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Athletes
                </p>
                <p className="font-display text-[24px] leading-none text-text tabular-nums">
                  {roster.length}
                </p>
                <p className="mt-1 text-[12px] text-accent-blue">{activeToday} active this week</p>
              </div>
              <div className="card-shine rounded-xl px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue-soft text-accent-blue">
                  <InboxIcon />
                </div>
                <p className="mt-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Requests
                </p>
                <p className="font-display text-[24px] leading-none text-text tabular-nums">
                  {pendingRequests.length}
                </p>
                <p className="mt-1 text-[12px] text-accent-blue">pending</p>
              </div>
            </div>

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
    </div>
  );
}
