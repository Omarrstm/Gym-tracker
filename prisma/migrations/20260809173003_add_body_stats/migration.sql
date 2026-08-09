-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "sex" "Sex",
ADD COLUMN     "weightKg" DOUBLE PRECISION;
