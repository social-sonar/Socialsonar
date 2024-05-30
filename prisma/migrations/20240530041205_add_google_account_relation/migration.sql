/*
  Warnings:

  - You are about to drop the column `userId` on the `google_account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "google_account" DROP CONSTRAINT "google_account_userId_fkey";

-- AlterTable
ALTER TABLE "google_account" DROP COLUMN "userId";
