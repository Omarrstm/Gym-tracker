-- CreateEnum
CREATE TYPE "CoachLinkStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CoachLinkSource" AS ENUM ('EMAIL_INVITE', 'JOIN_CODE', 'DIRECTORY_REQUEST');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED');

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "assignedByCoachId" TEXT;

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "joinCode" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachAthlete" (
    "id" TEXT NOT NULL,
    "status" "CoachLinkStatus" NOT NULL DEFAULT 'PENDING',
    "source" "CoachLinkSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "coachId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,

    CONSTRAINT "CoachAthlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachInvite" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "coachId" TEXT NOT NULL,

    CONSTRAINT "CoachInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "coachAthleteId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_joinCode_key" ON "CoachProfile"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");

-- CreateIndex
CREATE INDEX "CoachAthlete_coachId_status_idx" ON "CoachAthlete"("coachId", "status");

-- CreateIndex
CREATE INDEX "CoachAthlete_athleteId_status_idx" ON "CoachAthlete"("athleteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CoachAthlete_coachId_athleteId_key" ON "CoachAthlete"("coachId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachInvite_tokenHash_key" ON "CoachInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "CoachInvite_coachId_idx" ON "CoachInvite"("coachId");

-- CreateIndex
CREATE INDEX "CoachInvite_email_idx" ON "CoachInvite"("email");

-- CreateIndex
CREATE INDEX "Message_coachAthleteId_createdAt_idx" ON "Message"("coachAthleteId", "createdAt");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_assignedByCoachId_fkey" FOREIGN KEY ("assignedByCoachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachAthlete" ADD CONSTRAINT "CoachAthlete_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachAthlete" ADD CONSTRAINT "CoachAthlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachInvite" ADD CONSTRAINT "CoachInvite_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_coachAthleteId_fkey" FOREIGN KEY ("coachAthleteId") REFERENCES "CoachAthlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
