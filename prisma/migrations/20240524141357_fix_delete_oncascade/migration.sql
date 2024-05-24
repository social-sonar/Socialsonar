-- DropForeignKey
ALTER TABLE "contact_addresses" DROP CONSTRAINT "contact_addresses_addressId_fkey";

-- DropForeignKey
ALTER TABLE "contact_emails" DROP CONSTRAINT "contact_emails_emailId_fkey";

-- DropForeignKey
ALTER TABLE "contact_occupations" DROP CONSTRAINT "contact_occupations_occupationId_fkey";

-- DropForeignKey
ALTER TABLE "contact_organizations" DROP CONSTRAINT "contact_organizations_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "contact_phone_numbers" DROP CONSTRAINT "contact_phone_numbers_phoneNumberId_fkey";

-- DropForeignKey
ALTER TABLE "contact_photos" DROP CONSTRAINT "contact_photos_photoId_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_userId_fkey";

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_organizations" ADD CONSTRAINT "contact_organizations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_phone_numbers" ADD CONSTRAINT "contact_phone_numbers_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "phone_numbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_occupations" ADD CONSTRAINT "contact_occupations_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_photos" ADD CONSTRAINT "contact_photos_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_addresses" ADD CONSTRAINT "contact_addresses_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_emails" ADD CONSTRAINT "contact_emails_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
