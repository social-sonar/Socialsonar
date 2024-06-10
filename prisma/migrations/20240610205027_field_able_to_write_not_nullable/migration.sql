/*
  Warnings:

  - Made the column `ableToWrite` on table `google_account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "google_account" ALTER COLUMN "ableToWrite" SET NOT NULL;
