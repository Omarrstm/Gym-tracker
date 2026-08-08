"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { MuscleGroup } from "@/generated/prisma/client";
import { muscleGroupLabels } from "@/lib/muscleGroups";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  imageUrl: string | null;
};

function BarbellIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M6 7v10M18 7v10M2 10v4M22 10v4M6 12h12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function ExerciseModal({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-surface sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full bg-surface-2">
          {exercise.imageUrl ? (
            <Image
              src={exercise.imageUrl}
              alt={exercise.name}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
              <BarbellIcon />
              <p className="text-[12px]">No reference image yet</p>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-bg/80 text-text outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">
            {muscleGroupLabels[exercise.muscleGroup]}
          </p>
          <h2 className="font-display text-[24px] leading-tight tracking-wide text-text uppercase">
            {exercise.name}
          </h2>
        </div>
      </div>
    </div>
  );
}
