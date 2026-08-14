import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import MessageThread from "@/components/MessageThread";

export const dynamic = "force-dynamic";

export default async function AthleteCoachMessagesPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = await params;
  const { userId } = await verifySession();

  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId, athleteId: userId } },
    include: { coach: { select: { name: true, email: true } } },
  });
  if (!link || link.status !== "ACCEPTED") notFound();

  const messages = await prisma.message.findMany({
    where: { coachAthleteId: link.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto flex h-screen w-full max-w-md flex-1 flex-col px-4 py-6">
      <header className="mb-3">
        <Link
          href="/coaches/mine"
          className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          &larr; {link.coach.name ?? link.coach.email}
        </Link>
        <h1 className="mt-2 font-display text-[26px] leading-none tracking-wide text-text uppercase">
          Messages
        </h1>
      </header>

      <MessageThread
        counterpartUserId={coachId}
        currentUserId={userId}
        messages={messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          senderId: m.senderId,
        }))}
      />
    </div>
  );
}
