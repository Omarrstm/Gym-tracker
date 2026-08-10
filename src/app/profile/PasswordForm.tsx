"use client";

import { useState, useActionState } from "react";
import { updatePassword } from "./actions";

export default function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updatePassword, undefined);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border py-2.5 text-center text-[12px] font-semibold tracking-wide text-muted uppercase hover:border-accent hover:text-accent"
      >
        Change Password
      </button>
    );
  }

  return (
    <form
      action={formAction}
      key={state?.success}
      className="relative z-10 flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Current Password
        </span>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          New Password
        </span>
        <input
          name="newPassword"
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
      {state?.success && <p className="text-[12px] text-accent">{state.success}</p>}

      <div className="mt-1 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
        >
          {pending ? "Updating..." : "Update Password"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="shrink-0 text-[12px] font-semibold text-muted hover:text-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
