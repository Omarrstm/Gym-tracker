-- CreateEnum
CREATE TYPE "CoachSubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "CoachProfile" ADD COLUMN     "subscriptionStatus" "CoachSubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CoachExperience" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "coachProfileId" TEXT NOT NULL,

    CONSTRAINT "CoachExperience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachExperience_coachProfileId_idx" ON "CoachExperience"("coachProfileId");

-- AddForeignKey
ALTER TABLE "CoachExperience" ADD CONSTRAINT "CoachExperience_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
