-- DropForeignKey
ALTER TABLE "contact_google" DROP CONSTRAINT "contact_google_contactId_fkey";

-- AddForeignKey
ALTER TABLE "contact_google" ADD CONSTRAINT "contact_google_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
