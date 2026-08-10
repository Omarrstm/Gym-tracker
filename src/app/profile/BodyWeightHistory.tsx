"use client";

import { useState, useTransition } from "react";
import WeightTrendChart from "@/components/WeightTrendChart";
import { deleteBodyWeightLog } from "./actions";

type Log = { id: string; weightKg: number; date: string };

function LogEntryRow({ log }: { log: Log }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const dateLabel = new Date(log.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteBodyWeightLog(log.id);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3">
      <span className="text-[13px] text-muted">{dateLabel}</span>
      <div className="flex items-center gap-3">
        <span className="text-[13.5px] font-semibold text-text">{log.weightKg} kg</span>
        <button
          onClick={handleDelete}
          onBlur={() => setConfirmingDelete(false)}
          disabled={isPending}
          className={`text-[12px] font-semibold underline-offset-2 hover:underline disabled:opacity-50 ${
            confirmingDelete ? "text-red-400" : "text-muted hover:text-red-400"
          }`}
        >
          {confirmingDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function BodyWeightHistory({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return <p className="text-[12.5px] text-muted">No weight logged yet.</p>;
  }

  const chartData = logs.map((l) => ({ date: l.date, weight: l.weightKg }));
  const reversed = [...logs].reverse();

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-surface px-3.5 py-3.5">
        <WeightTrendChart data={chartData} />
      </div>
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {reversed.map((log) => (
          <LogEntryRow key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
