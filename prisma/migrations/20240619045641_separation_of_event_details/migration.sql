/*
  Warnings:

  - You are about to drop the column `guests` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `requesterEmail` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `requesterName` on the `event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event" DROP COLUMN "guests",
DROP COLUMN "requesterEmail",
DROP COLUMN "requesterName",
ADD COLUMN     "googleEventId" TEXT;

-- CreateTable
CREATE TABLE "event_detail" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "guests" TEXT[],

    CONSTRAINT "event_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_detail_eventId_key" ON "event_detail"("eventId");

-- AddForeignKey
ALTER TABLE "event_detail" ADD CONSTRAINT "event_detail_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
