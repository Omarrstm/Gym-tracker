"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "./actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  return (
    <>
      <form action={formAction} className="relative z-10 mt-5 flex flex-col gap-3">
        <input type="hidden" name="token" value={token} />

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            New Password
          </span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Confirm New Password
          </span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
          />
        </label>

        {state?.error && <p className="text-[12px] text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
        >
          {pending ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {state?.error && (
        <p className="relative z-10 mt-4 text-center text-[13px] text-muted">
          <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
            Request a new link
          </Link>
        </p>
      )}
    </>
  );
}
