import Link from "next/link";

const featureTags = [
  "Weekly Programs",
  "PR Tracking",
  "1RM Trends",
  "Coaching",
  "Rest Timer",
  "Body Stats",
];

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6M12 2v3" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

const features = [
  {
    title: "Weekly Programs",
    icon: CalendarIcon,
    description:
      "Build multiple training programs, assign exercises to specific days, and set target weight, sets, and reps. Keep one active at a time.",
  },
  {
    title: "Progress Tracking",
    icon: TrendingUpIcon,
    description:
      "Automatic personal record detection and an estimated 1RM chart with selectable time ranges, per exercise.",
  },
  {
    title: "Smart Set Logging",
    icon: PencilIcon,
    description:
      "Log weight, sets, reps, and RIR in seconds. Flag warm-up sets so they stay out of your stats, and add notes per set.",
  },
  {
    title: "Coaching",
    icon: UsersIcon,
    description:
      "Coaches get a public profile and dashboard to manage athletes, assign programs, and track their progress directly.",
  },
  {
    title: "Rest Timer",
    icon: TimerIcon,
    description:
      "A configurable default rest time that follows you into every workout, so you're not guessing between sets.",
  },
  {
    title: "Body Stats",
    icon: ActivityIcon,
    description:
      "Track body weight history alongside BMI and BMR, plus session progress badges vs. your prior workout.",
  },
];

const faqs = [
  {
    question: "Is Gym Tracker free?",
    answer: "Yes. It's free to use, with no ads and no paid tiers.",
  },
  {
    question: "Can coaches use it too?",
    answer:
      "Coaches get their own public profile and dashboard, can link up with athletes, and assign or review their programs directly.",
  },
  {
    question: "How does PR and 1RM tracking work?",
    answer:
      "Every set you log is checked against your history automatically, so personal records are detected without any manual work. Each exercise also gets an estimated 1RM chart you can view over different time ranges.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your workouts, programs, and body stats are only visible to you, and to a coach you've explicitly linked with.",
  },
  {
    question: "Is there a mobile app?",
    answer: "A native mobile app is currently in development alongside the web app.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-border/70 py-5">
          <p className="font-display text-[20px] tracking-[0.12em] text-text uppercase">
            Gym Tracker
          </p>
          <nav className="flex items-center gap-3">
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

        <section className="relative grid grid-cols-1 items-center gap-10 overflow-hidden pt-14 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pt-20 lg:pb-24">
          <div
            className="pointer-events-none absolute top-0 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-30 blur-[100px]"
            style={{ background: "var(--color-accent)" }}
          />

          <div>
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

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="text-accent">&#9679;</span>
                <span className="font-bold text-text">Free</span> core, forever
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-accent">&#9679;</span>
                No ads, ever
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-accent">&#9679;</span>
                Web &amp; mobile
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {featureTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[300px] lg:mx-0 lg:ml-auto">
            <div className="absolute -top-4 -right-4 -z-10 w-[85%] rounded-[28px] border border-border bg-surface-2/80 p-4 opacity-70 blur-[1px]">
              <div className="h-2 w-16 rounded-full bg-border" />
              <div className="mt-4 h-20 rounded-xl bg-border/50" />
            </div>

            <div className="card-shine rounded-[28px] p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 text-[10px] font-semibold tracking-wide text-accent uppercase">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  Push &middot; Today
                </span>
                <span className="text-[10px] font-semibold text-muted">2/5 logged</span>
              </div>

              <p className="mt-3 font-display text-[19px] leading-tight tracking-wide text-text uppercase">
                Start Your Push Day Workout
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                  <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Streak</p>
                  <p className="font-display text-[20px] leading-none text-text tabular-nums">12</p>
                  <p className="mt-1 text-[10.5px] text-accent">days</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                  <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">This Week</p>
                  <p className="font-display text-[20px] leading-none text-text tabular-nums">8.4k</p>
                  <p className="mt-1 text-[10.5px] text-accent">lbs lifted</p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                <span className="text-[11.5px] font-semibold text-text">Bench Press &middot; Set 3</span>
                <span className="text-[11.5px] font-bold text-accent">185 &times; 5</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/70 py-14 lg:py-20">
          <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">
            Features
          </p>
          <h2 className="mt-1 font-display text-[30px] leading-none tracking-wide text-text uppercase sm:text-[36px]">
            Everything you need to stay consistent
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
            Built to make logging effortless and progress obvious &mdash; every feature designed
            around actually showing up to lift.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card-shine rounded-2xl p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent-soft text-accent">
                    <Icon />
                  </div>
                  <h3 className="mt-3 font-display text-[18px] tracking-wide text-text uppercase">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border/70 py-14 lg:py-20">
          <p className="font-display text-[13px] tracking-[0.12em] text-accent uppercase">FAQ</p>
          <h2 className="mt-1 font-display text-[30px] leading-none tracking-wide text-text uppercase sm:text-[36px]">
            Frequently asked questions
          </h2>

          <div className="mt-8 max-w-2xl divide-y divide-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-text">
                  {faq.question}
                  <span className="shrink-0 text-muted transition-transform group-open:rotate-180">
                    &#9660;
                  </span>
                </summary>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t border-border/70 py-16 text-center lg:py-20">
          <h2 className="font-display text-[28px] leading-none tracking-wide text-text uppercase sm:text-[34px]">
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

        <footer className="flex flex-col gap-4 border-t border-border/70 py-8 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-[15px] tracking-[0.1em] text-text uppercase">
            Gym Tracker
          </p>
          <p>&copy; {new Date().getFullYear()} Gym Tracker. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
