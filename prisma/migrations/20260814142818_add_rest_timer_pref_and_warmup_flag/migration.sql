-- AlterTable
ALTER TABLE "User" ADD COLUMN     "restTimerSeconds" INTEGER NOT NULL DEFAULT 90;

-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN     "isWarmup" BOOLEAN NOT NULL DEFAULT false;
