/*
  Warnings:

  - You are about to drop the `google_sync_token` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `token` to the `google_account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "google_sync_token" DROP CONSTRAINT "google_sync_token_googleAccountId_fkey";

-- AlterTable
ALTER TABLE "google_account" ADD COLUMN     "token" TEXT NOT NULL;

-- DropTable
DROP TABLE "google_sync_token";
