import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ExercisePicker from "@/components/ExercisePicker";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    select: { id: true, name: true, muscleGroup: true, imageUrl: true, description: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="relative min-h-screen w-full flex-1">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/backgrounds/gym-side.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-bg md:hidden" />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, var(--color-bg) 0%, var(--color-bg) 36%, transparent 72%)",
          }}
        />
      </div>

      <div className="flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-start justify-between border-b border-border/70 px-4 pt-6 pb-4">
          <div>
            <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
              Exercise Library
            </p>
            <h1 className="font-display text-[32px] leading-none tracking-wide text-text uppercase">
              Pick Exercise
            </h1>
          </div>
          <div className="mt-1 flex flex-col items-end gap-1.5">
            <Link
              href="/"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              Today
            </Link>
            <Link
              href="/history"
              className="text-[12px] font-semibold tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              History
            </Link>
          </div>
        </header>
        <ExercisePicker exercises={exercises} />
      </div>
    </div>
  );
}
