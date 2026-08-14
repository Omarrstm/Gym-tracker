"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";

function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  return (
    <form action={formAction} className="relative z-10 mt-5 flex flex-col gap-3">
      {next && <input type="hidden" name="next" value={next} />}
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
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Password
          </span>
          <Link
            href="/forgot-password"
            className="text-[11px] font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>
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
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center px-4">
      <div className="card-shine w-full max-w-sm rounded-2xl p-6">
        <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
          Gym Tracker
        </p>
        <h1 className="font-display text-[28px] leading-none tracking-wide text-text uppercase">
          Log In
        </h1>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

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
