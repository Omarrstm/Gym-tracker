/*
  Warnings:

  - Added the required column `targetReps` to the `ProgramExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetSets` to the `ProgramExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetWeight` to the `ProgramExercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgramExercise" ADD COLUMN     "targetReps" INTEGER NOT NULL,
ADD COLUMN     "targetSets" INTEGER NOT NULL,
ADD COLUMN     "targetWeight" DOUBLE PRECISION NOT NULL;
