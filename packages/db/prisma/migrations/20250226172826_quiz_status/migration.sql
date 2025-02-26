-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "status" "QuizStatus" NOT NULL DEFAULT 'PENDING';
