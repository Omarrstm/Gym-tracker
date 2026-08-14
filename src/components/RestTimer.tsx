"use client";

import { useEffect, useState } from "react";

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function RestTimer({
  duration,
  onDismiss,
}: {
  duration: number;
  onDismiss: () => void;
}) {
  const [remaining, setRemaining] = useState(duration);
  const isDone = remaining <= 0;

  useEffect(() => {
    if (isDone) return;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isDone]);

  useEffect(() => {
    if (!isDone) return;
    const id = setTimeout(onDismiss, 5000);
    return () => clearTimeout(id);
  }, [isDone, onDismiss]);

  function adjust(delta: number) {
    setRemaining((r) => Math.max(0, r + delta));
  }

  const progress = Math.min(1, remaining / duration);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="card-shine flex items-center gap-4 rounded-2xl px-4 py-3 shadow-xl">
        <div className="relative z-10 h-14 w-14 shrink-0">
          <svg viewBox="0 0 64 64" className="h-14 w-14 -rotate-90">
            <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r={RADIUS}
              fill="none"
              stroke={isDone ? "var(--color-muted)" : "var(--color-accent)"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular-nums text-text">
            {formatTime(remaining)}
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col gap-1">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            {isDone ? "Rest complete" : "Resting"}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjust(-15)}
              className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-muted hover:text-accent"
            >
              -15s
            </button>
            <button
              onClick={() => adjust(15)}
              className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-muted hover:text-accent"
            >
              +15s
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Dismiss rest timer"
          className="relative z-10 shrink-0 text-[12px] font-semibold text-muted hover:text-text"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
