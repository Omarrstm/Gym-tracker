import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import ProgramList from "@/components/ProgramList";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function ProgramListPage() {
  const user = await getUser();
  const userId = user.id;

  const programs = await prisma.program.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { days: { include: { _count: { select: { exercises: true } } } } },
  });

  const summaries = programs.map((p) => ({
    id: p.id,
    name: p.name,
    isActive: p.isActive,
    dayCount: p.days.length,
    exerciseCount: p.days.reduce((sum, d) => sum + d._count.exercises, 0),
  }));

  return (
    <div className="relative min-h-screen w-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <AppHeader userName={user.name} />

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="pt-8 pb-4">
            <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              Training
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              Programs
            </h1>
          </div>

          <div className="pb-6">
            {summaries.length === 0 ? (
              <p className="mb-3 text-[13px] text-muted">
                You don&rsquo;t have any programs yet. Create one to start planning your week.
              </p>
            ) : null}
            <ProgramList programs={summaries} />
          </div>
        </div>
      </div>
    </div>
  );
}
