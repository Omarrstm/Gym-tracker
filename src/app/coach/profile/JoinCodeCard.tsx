"use client";

import { useState, useTransition } from "react";
import { regenerateJoinCode } from "../actions";

export default function JoinCodeCard({ joinCode }: { joinCode: string }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleRegenerate() {
    setError(null);
    startTransition(async () => {
      try {
        await regenerateJoinCode();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="relative z-10 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
        <span className="font-display text-[22px] tracking-[0.15em] text-text">{joinCode}</span>
        <button
          onClick={handleCopy}
          className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase hover:text-accent"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-[11px] text-muted">
        Share this code with an athlete — they can enter it on the Coaches page to link with you
        instantly.
      </p>
      {error && <p className="text-[12px] text-red-400">{error}</p>}
      <button
        onClick={handleRegenerate}
        disabled={pending}
        className="w-fit text-[11px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline disabled:opacity-50"
      >
        {pending ? "Generating..." : "Generate a new code"}
      </button>
    </div>
  );
}
