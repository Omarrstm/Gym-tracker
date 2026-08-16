"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
      />
      <div className="card-shine w-full max-w-sm rounded-2xl p-6">
        <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Gym Tracker
        </p>
        <h1 className="font-display text-[28px] leading-none tracking-wide text-text uppercase">
          Forgot Password
        </h1>
        <p className="relative z-10 mt-2 text-[13px] text-muted">
          Enter your email and we&rsquo;ll send you a link to reset your password.
        </p>

        <form action={formAction} key={state?.success} className="relative z-10 mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              Email
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
            />
          </label>

          {state?.error && <p className="text-[12px] text-red-400">{state.error}</p>}
          {state?.success && <p className="text-[12px] text-accent">{state.success}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="relative z-10 mt-4 text-center text-[13px] text-muted">
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
