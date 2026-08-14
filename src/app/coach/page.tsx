import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireCoachProfile } from "@/lib/coachDal";
import { getStreakAndWeekVolume } from "@/lib/stats";
import InviteAthleteForm from "./InviteAthleteForm";
import RequestRow from "./RequestRow";

export const dynamic = "force-dynamic";

export default async function CoachDashboardPage() {
  const profile = await requireCoachProfile();

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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-5">
        <Link
          href="/"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; Home
        </Link>
        <p className="mt-3 font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Coaching
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          Dashboard
        </h1>
      </header>

      <div className="flex flex-col gap-4">
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
              No athletes yet — invite one by email or share your join code from your coach profile.
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

        <Link
          href="/coach/profile"
          className="text-center text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          Edit Coach Profile
        </Link>
      </div>
    </div>
  );
}
