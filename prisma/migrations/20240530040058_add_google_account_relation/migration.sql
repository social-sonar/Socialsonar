/*
  Warnings:

  - Added the required column `userId` to the `google_account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "google_account" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "google_account" ADD CONSTRAINT "google_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
