"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondToRequest } from "./actions";

export default function RequestRow({ athleteId, name }: { athleteId: string; name: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function respond(accept: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        await respondToRequest(athleteId, accept);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-text">{name}</p>
        <div className="flex gap-2">
          <button
            onClick={() => respond(true)}
            disabled={pending}
            className="rounded-lg bg-accent px-3 py-1.5 text-[11px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => respond(false)}
            disabled={pending}
            className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      </div>
      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
