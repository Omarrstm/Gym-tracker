import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import RevokeLinkButton from "@/components/RevokeLinkButton";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function MyCoachesPage() {
  const user = await getUser();
  const userId = user.id;

  const links = await prisma.coachAthlete.findMany({
    where: { athleteId: userId, status: { in: ["ACCEPTED", "PENDING"] } },
    include: { coach: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const accepted = links.filter((l) => l.status === "ACCEPTED");
  const pending = links.filter((l) => l.status === "PENDING");

  const assignedPrograms =
    accepted.length > 0
      ? await prisma.program.findMany({
          where: { userId, assignedByCoachId: { in: accepted.map((l) => l.coachId) } },
          select: { id: true, name: true, isActive: true, assignedByCoachId: true },
        })
      : [];

  return (
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <AppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
      <header className="mb-5">
        <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Coaching
        </p>
        <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
          My Coaches
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        {pending.length > 0 && (
          <section className="card-shine rounded-2xl p-6">
            <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
              Pending Requests
            </h2>
            <div className="relative z-10 flex flex-col gap-2">
              {pending.map((l) => (
                <p key={l.id} className="text-[13.5px] text-muted">
                  {l.coach.name ?? l.coach.email} — awaiting response
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="card-shine rounded-2xl p-6">
          <h2 className="relative z-10 mb-4 font-display text-[15px] tracking-wide text-text uppercase">
            Your Coaches
          </h2>
          {accepted.length === 0 ? (
            <p className="relative z-10 text-[13px] text-muted">
              No coaches yet.{" "}
              <Link href="/coaches" className="text-accent hover:underline">
                Find one
              </Link>{" "}
              or enter a join code.
            </p>
          ) : (
            <div className="relative z-10 flex flex-col gap-3">
              {accepted.map((l) => {
                const programs = assignedPrograms.filter((p) => p.assignedByCoachId === l.coachId);
                return (
                  <div key={l.id} className="card-shine rounded-xl px-4 py-3">
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14.5px] font-semibold text-text">
                          {l.coach.name ?? l.coach.email}
                        </p>
                        <Link
                          href={`/coaches/mine/${l.coachId}/messages`}
                          className="text-[12px] font-semibold text-accent hover:underline"
                        >
                          Message
                        </Link>
                      </div>
                      <RevokeLinkButton counterpartUserId={l.coachId} label="Unlink" />
                    </div>
                    {programs.length > 0 && (
                      <div className="relative z-10 mt-2 flex flex-col gap-1 border-t border-border pt-2">
                        {programs.map((p) => (
                          <Link
                            key={p.id}
                            href={`/program/${p.id}`}
                            className="flex items-center justify-between text-[12.5px] text-text hover:text-accent"
                          >
                            <span>{p.name}</span>
                            {p.isActive && <span className="text-[10px] text-accent">Active</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
        </div>
      </div>
    </div>
  );
}
