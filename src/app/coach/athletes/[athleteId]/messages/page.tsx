import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { requireCoachProfile } from "@/lib/coachDal";
import MessageThread from "@/components/MessageThread";
import CoachAppHeader from "@/components/CoachAppHeader";

export const dynamic = "force-dynamic";

export default async function CoachAthleteMessagesPage({
  params,
}: {
  params: Promise<{ athleteId: string }>;
}) {
  const { athleteId } = await params;
  const profile = await requireCoachProfile();
  const coachId = profile.userId;
  const user = await getUser();

  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId, athleteId } },
    include: { athlete: { select: { name: true, email: true } } },
  });
  if (!link || link.status !== "ACCEPTED") notFound();

  const messages = await prisma.message.findMany({
    where: { coachAthleteId: link.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex h-screen w-full flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
        <CoachAppHeader userName={user.name} />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden px-4 py-6">
        <header className="mb-3">
          <Link
            href={`/coach/athletes/${athleteId}`}
            className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            &larr; {link.athlete.name ?? link.athlete.email}
          </Link>
          <h1 className="mt-2 font-display text-[26px] leading-none tracking-wide text-text uppercase">
            Messages
          </h1>
        </header>

        <MessageThread
          counterpartUserId={athleteId}
          currentUserId={coachId}
          messages={messages.map((m) => ({
            id: m.id,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
            senderId: m.senderId,
          }))}
        />
      </div>
    </div>
  );
}
