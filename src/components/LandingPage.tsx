import Image from "next/image";
import Link from "next/link";

const featureTags = [
  "Weekly Programs",
  "PR Tracking",
  "1RM Trends",
  "Coaching",
  "Rest Timer",
  "Body Stats",
];

const features = [
  {
    title: "Weekly Programs",
    description:
      "Build multiple training programs, assign exercises to specific days, and set target weight, sets, and reps. Keep one active at a time.",
  },
  {
    title: "Progress Tracking",
    description:
      "Automatic personal record detection and an estimated 1RM chart with selectable time ranges, per exercise.",
  },
  {
    title: "Coaching",
    description:
      "Coaches get a public profile and dashboard to manage athletes, assign programs, and message them directly.",
  },
  {
    title: "Smart Set Logging",
    description:
      "Log weight, sets, reps, and RIR in seconds. Flag warm-up sets so they stay out of your stats, and add notes per set.",
  },
  {
    title: "Rest Timer",
    description:
      "A configurable default rest time that follows you into every workout, so you're not guessing between sets.",
  },
  {
    title: "Body Stats",
    description:
      "Track body weight history alongside BMI and BMR, plus session progress badges vs. your prior workout.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full flex-1">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src="/backgrounds/gym-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="scale-105 object-cover object-top blur-[2px]"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,14,23,0.55) 0%, rgba(10,14,23,0.85) 35%, var(--color-bg) 62%)",
          }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col">
        <header className="flex items-center justify-between px-4 pt-6 pb-4">
          <p className="font-display text-[20px] tracking-[0.12em] text-text uppercase">
            Gym Tracker
          </p>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[13px] font-semibold tracking-wide text-muted hover:text-accent"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-accent px-4 py-2 text-[13px] font-bold tracking-wide text-bg uppercase"
            >
              Sign Up
            </Link>
          </nav>
        </header>

        <section className="px-4 pt-10 pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Free &amp; self-hosted
          </span>

          <h1 className="mt-4 font-display text-[44px] leading-[0.95] tracking-wide text-text uppercase sm:text-[56px]">
            The workout tracker built for{" "}
            <span className="text-accent">consistent progress</span>
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            Plan weekly programs, log every set as you lift, and watch your PRs and
            estimated 1RM trend up over time &mdash; with coaching built in.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-accent px-6 py-3 text-center text-[13px] font-bold tracking-wide text-bg uppercase shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-border px-6 py-3 text-center text-[13px] font-bold tracking-wide text-text uppercase"
            >
              Log In
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {featureTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="px-4 pt-6 pb-10">
          <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
            Features
          </p>
          <h2 className="mt-1 font-display text-[28px] leading-none tracking-wide text-text uppercase">
            Everything you need to stay consistent
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="card-shine rounded-2xl p-5">
                <h3 className="font-display text-[18px] tracking-wide text-text uppercase">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pt-4 pb-16 text-center">
          <h2 className="font-display text-[26px] leading-none tracking-wide text-text uppercase">
            Ready to start tracking?
          </h2>
          <p className="mt-2 text-[14px] text-muted">
            Free, no ads, and your data stays yours.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-xl bg-accent px-6 py-3 text-center text-[13px] font-bold tracking-wide text-bg uppercase shadow-lg"
          >
            Create Your Account
          </Link>
        </section>
      </div>
    </div>
  );
}
