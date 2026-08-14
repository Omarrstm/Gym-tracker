"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptCoachInvite } from "@/app/coach/actions";

export default function AcceptInviteButton({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (done) {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-2.5 text-center text-[13px] font-semibold text-accent">
        Invite accepted!
      </p>
    );
  }

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      try {
        await acceptCoachInvite(token);
        setDone(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't accept this invite.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-[12px] text-red-400">{error}</p>}
      <button
        onClick={handleAccept}
        disabled={pending}
        className="w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
      >
        {pending ? "Accepting..." : "Accept Invite"}
      </button>
    </div>
  );
}
