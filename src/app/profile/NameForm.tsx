"use client";

import { useActionState } from "react";
import { updateName } from "./actions";

export default function NameForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(updateName, undefined);

  return (
    <form action={formAction} className="relative z-10 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Name
        </span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={initialName}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
        />
      </label>

      {state?.error && <p className="text-[12px] text-red-400">{state.error}</p>}
      {state?.success && <p className="text-[12px] text-accent">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-accent py-2.5 text-center text-[13px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Name"}
      </button>
    </form>
  );
}
