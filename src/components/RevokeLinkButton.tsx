"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revokeLink } from "@/app/coach/actions";

export default function RevokeLinkButton({
  counterpartUserId,
  redirectTo,
  label = "Remove",
}: {
  counterpartUserId: string;
  redirectTo?: string;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await revokeLink(counterpartUserId);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't remove this link.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        onBlur={() => setConfirming(false)}
        disabled={pending}
        className={`text-[12px] font-semibold underline-offset-2 hover:underline disabled:opacity-50 ${
          confirming ? "text-red-400" : "text-muted hover:text-red-400"
        }`}
      >
        {confirming ? "Confirm?" : label}
      </button>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
