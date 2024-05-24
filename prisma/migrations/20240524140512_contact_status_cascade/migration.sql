-- DropForeignKey
ALTER TABLE "contact_status" DROP CONSTRAINT "contact_status_finalContactId_fkey";

-- DropForeignKey
ALTER TABLE "contact_status" DROP CONSTRAINT "contact_status_firstContactId_fkey";

-- DropForeignKey
ALTER TABLE "contact_status" DROP CONSTRAINT "contact_status_secondContactId_fkey";

-- AddForeignKey
ALTER TABLE "contact_status" ADD CONSTRAINT "contact_status_firstContactId_fkey" FOREIGN KEY ("firstContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_status" ADD CONSTRAINT "contact_status_secondContactId_fkey" FOREIGN KEY ("secondContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_status" ADD CONSTRAINT "contact_status_finalContactId_fkey" FOREIGN KEY ("finalContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
