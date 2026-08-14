"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestCoach } from "@/app/coach/actions";

export default function RequestCoachButton({
  coachUserId,
  linkStatus,
}: {
  coachUserId: string;
  linkStatus: "NONE" | "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED";
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (linkStatus === "ACCEPTED") {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-2.5 text-center text-[13px] font-semibold text-accent">
        You&rsquo;re linked with this coach
      </p>
    );
  }

  if (linkStatus === "PENDING") {
    return (
      <p className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-center text-[13px] font-semibold text-muted">
        Request pending
      </p>
    );
  }

  function handleRequest() {
    setError(null);
    startTransition(async () => {
      try {
        await requestCoach(coachUserId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't send the request.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-[12px] text-red-400">{error}</p>}
      <button
        onClick={handleRequest}
        disabled={pending}
        className="w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
      >
        {pending ? "Requesting..." : "Request to be Coached"}
      </button>
    </div>
  );
}
