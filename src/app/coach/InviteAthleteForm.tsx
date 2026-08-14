"use client";

import { useActionState } from "react";
import { sendCoachInvite } from "./actions";

export default function InviteAthleteForm() {
  const [state, formAction, pending] = useActionState(sendCoachInvite, undefined);

  return (
    <form action={formAction} className="relative z-10 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Invite an athlete by email
        </span>
        <input
          name="email"
          type="email"
          required
          placeholder="athlete@example.com"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      {state?.error && <p className="text-[12px] text-red-400">{state.error}</p>}
      {state?.success && <p className="text-[12px] text-accent">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send Invite"}
      </button>
    </form>
  );
}
