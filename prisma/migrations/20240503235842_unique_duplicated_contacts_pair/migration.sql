/*
  Warnings:

  - A unique constraint covering the columns `[firstContactId,secondContactId]` on the table `contact_status` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contact_status_firstContactId_secondContactId_key" ON "contact_status"("firstContactId", "secondContactId");
