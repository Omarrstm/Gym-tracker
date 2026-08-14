"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinByCode } from "@/app/coach/actions";

export default function JoinCodeForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await joinByCode(code);
        setSuccess("Linked up! Check My Coach for details.");
        setCode("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't join with that code.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Have a join code?
        </span>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ABC123XY"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] tracking-[0.1em] text-text uppercase outline-none focus-visible:border-accent"
        />
      </label>
      {error && <p className="text-[12px] text-red-400">{error}</p>}
      {success && <p className="text-[12px] text-accent">{success}</p>}
      <button
        type="submit"
        disabled={pending || code.trim().length === 0}
        className="w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
      >
        {pending ? "Joining..." : "Join with Code"}
      </button>
    </form>
  );
}
