# Gym Tracker

A self-hosted workout tracker built with Next.js. Plan weekly training programs, log sets as you lift, and track progress over time — estimated 1RM trends, personal records, and body weight history.

## Features

- **Weekly programs** — build multiple programs, assign exercises to specific days, set optional target weight/sets/reps, and mark one program active at a time.
- **Workout logging** — log weight, sets, reps, and RIR against today's session, edit or delete past entries, add notes, and flag warm-up sets so they're excluded from stats.
- **Progress tracking** — per-exercise history, personal record (PR) detection, and an estimated 1RM chart with selectable time ranges.
- **Dashboard & stats** — a home screen with a start-workout CTA and session progress, plus a muscle-group breakdown view.
- **Profile** — body stats (height, weight, DOB, sex) with BMI/BMR, body weight logging and history, a configurable rest timer, password changes, and account deletion.
- **Auth** — email/password signup and login with session cookies, plus a forgot-password flow that emails a reset link via Resend.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Prisma 7](https://www.prisma.io) with the Postgres driver adapter (`@prisma/adapter-pg`)
- Tailwind CSS 4
- [Resend](https://resend.com) for transactional email (password reset)
- `jose` for session JWTs, `bcryptjs` for password hashing

## Getting started

### Prerequisites

- Node.js
- A PostgreSQL database (e.g. via `npx create-db` for a free hosted Prisma Postgres instance)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with:

   ```bash
   DATABASE_URL=postgresql://...
   SESSION_SECRET=some-long-random-string
   RESEND_API_KEY=re_...   # optional, only needed for password-reset emails
   ```

3. Apply the database schema:

   ```bash
   npx prisma migrate deploy
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Build for production     |
| `npm run start` | Run the production build |
| `npm run lint`  | Lint the codebase        |

## Data model

Defined in [`prisma/schema.prisma`](prisma/schema.prisma): `User`, `Exercise`, `WorkoutLog`, `Program` → `ProgramDay` → `ProgramExercise`, `BodyWeightLog`, `Session`, and `PasswordResetToken`.
