"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "./actions";

export default function DeleteAccountSection() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteAccount(password);
        router.push("/login");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't delete your account.");
        setConfirming(false);
      }
    });
  }

  return (
    <div className="relative z-10 flex flex-col gap-3">
      <p className="text-[12.5px] leading-relaxed text-muted">
        Permanently deletes your account and everything in it &mdash; programs, logged sets,
        weight history. This can&rsquo;t be undone.
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Confirm Password
        </span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setConfirming(false);
          }}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-red-400"
        />
      </label>

      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <button
        onClick={handleDelete}
        disabled={isPending || !password}
        className={`w-full rounded-xl py-2.5 text-center text-[13px] font-bold tracking-wide uppercase disabled:opacity-50 ${
          confirming ? "bg-red-500 text-white" : "border border-red-400/60 text-red-400"
        }`}
      >
        {isPending
          ? "Deleting..."
          : confirming
            ? "Click again to permanently delete"
            : "Delete Account"}
      </button>
    </div>
  );
}
