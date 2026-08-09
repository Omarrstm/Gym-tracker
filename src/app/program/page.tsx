import Link from "next/link";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import ProgramList from "@/components/ProgramList";

export const dynamic = "force-dynamic";

export default async function ProgramListPage() {
  const { userId } = await verifySession();

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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="flex items-start justify-between border-b border-border px-4 pt-6 pb-4">
        <div>
          <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
            Training
          </p>
          <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
            Programs
          </h1>
        </div>
        <Link
          href="/"
          className="mt-1 text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          Today
        </Link>
      </header>

      <div className="px-4 pt-4 pb-6">
        {summaries.length === 0 ? (
          <p className="mb-3 text-[13px] text-muted">
            You don&rsquo;t have any programs yet. Create one to start planning your week.
          </p>
        ) : null}
        <ProgramList programs={summaries} />
      </div>
    </div>
  );
}
