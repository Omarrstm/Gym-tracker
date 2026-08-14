import Link from "next/link";
import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import { getSessionCookie } from "@/lib/session";
import AcceptInviteButton from "./AcceptInviteButton";

export const dynamic = "force-dynamic";

export default async function CoachInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invite = await prisma.coachInvite.findUnique({
    where: { tokenHash },
    include: { coach: { select: { name: true } } },
  });

  const nextUrl = `/coach-invite/${token}`;
  const invalid = !invite || invite.status !== "PENDING" || invite.expiresAt < new Date();

  const session = await getSessionCookie();
  let loggedIn = false;
  if (session?.sessionId) {
    const dbSession = await prisma.session.findUnique({ where: { id: session.sessionId as string } });
    loggedIn = !!dbSession && dbSession.expiresAt > new Date();
  }

  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center px-4">
      <div className="card-shine w-full max-w-sm rounded-2xl p-6">
        <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Gym Tracker
        </p>
        <h1 className="font-display text-[28px] leading-none tracking-wide text-text uppercase">
          Coach Invite
        </h1>

        {invalid ? (
          <p className="relative z-10 mt-5 text-[14px] text-muted">
            This invite is invalid or has expired. Ask your coach to send a new one.
          </p>
        ) : (
          <>
            <p className="relative z-10 mt-5 text-[14px] text-text">
              <span className="font-semibold">{invite.coach.name ?? "A coach"}</span> invited you to
              be coached on Gym Tracker.
            </p>

            <div className="relative z-10 mt-5">
              {loggedIn ? (
                <AcceptInviteButton token={token} />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/login?next=${encodeURIComponent(nextUrl)}`}
                    className="w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase"
                  >
                    Log In to Accept
                  </Link>
                  <Link
                    href={`/signup?next=${encodeURIComponent(nextUrl)}`}
                    className="w-full rounded-xl border border-border py-2.5 text-center text-[13px] font-bold tracking-wide text-text uppercase"
                  >
                    Sign Up to Accept
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
