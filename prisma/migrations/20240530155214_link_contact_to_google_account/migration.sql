-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "googleAccountId" TEXT;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "google_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
