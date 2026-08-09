"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center px-4">
      <div className="card-shine w-full max-w-sm rounded-2xl p-6">
        <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Gym Tracker
        </p>
        <h1 className="font-display text-[28px] leading-none tracking-wide text-text uppercase">
          Log In
        </h1>

        <form action={formAction} className="relative z-10 mt-5 flex flex-col gap-3">
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

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
            />
          </label>

          {state?.error && <p className="text-[12px] text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
          >
            {pending ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="relative z-10 mt-4 text-center text-[13px] text-muted">
          Don&rsquo;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
