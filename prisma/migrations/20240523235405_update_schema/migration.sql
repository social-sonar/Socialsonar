-- DropForeignKey
ALTER TABLE "contact_occupations" DROP CONSTRAINT "contact_occupations_contactId_fkey";

-- AddForeignKey
ALTER TABLE "contact_occupations" ADD CONSTRAINT "contact_occupations_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
