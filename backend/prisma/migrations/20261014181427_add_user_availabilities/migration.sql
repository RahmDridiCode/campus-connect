-- AlterTable
ALTER TABLE "users" ADD COLUMN     "availabilities" TEXT[] DEFAULT ARRAY[]::TEXT[];
