-- AlterTable
ALTER TABLE "help_requests" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "notes" TEXT;
