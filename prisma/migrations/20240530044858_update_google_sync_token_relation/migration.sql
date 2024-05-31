/*
  Warnings:

  - You are about to drop the column `userId` on the `google_sync_token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleAccountId]` on the table `google_sync_token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleAccountId` to the `google_sync_token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "google_sync_token" DROP CONSTRAINT "google_sync_token_userId_fkey";

-- DropIndex
DROP INDEX "google_sync_token_userId_key";

-- AlterTable
ALTER TABLE "google_sync_token" DROP COLUMN "userId",
ADD COLUMN     "googleAccountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "googleSyncTokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "google_sync_token_googleAccountId_key" ON "google_sync_token"("googleAccountId");

-- AddForeignKey
ALTER TABLE "google_sync_token" ADD CONSTRAINT "google_sync_token_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "google_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_googleSyncTokenId_fkey" FOREIGN KEY ("googleSyncTokenId") REFERENCES "google_sync_token"("id") ON DELETE SET NULL ON UPDATE CASCADE;
