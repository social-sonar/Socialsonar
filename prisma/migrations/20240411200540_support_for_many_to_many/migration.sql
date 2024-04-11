/*
  Warnings:

  - You are about to drop the column `address` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `organization` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `contacts` table. All the data in the column will be lost.
  - Added the required column `nickName` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PhoneNumberType" AS ENUM ('CELL', 'HOME', 'WORK');

-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "occupation",
DROP COLUMN "organization",
DROP COLUMN "phoneNumber",
DROP COLUMN "photoUrl",
ADD COLUMN     "nickName" VARCHAR NOT NULL;

-- CreateTable
CREATE TABLE "organizations" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" BIGSERIAL NOT NULL,
    "number" VARCHAR NOT NULL,
    "type" "PhoneNumberType" NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupations" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" BIGSERIAL NOT NULL,
    "url" VARCHAR NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" BIGSERIAL NOT NULL,
    "countryCode" VARCHAR NOT NULL,
    "city" VARCHAR NOT NULL,
    "region" VARCHAR NOT NULL,
    "postalCode" VARCHAR NOT NULL,
    "streetAddress" VARCHAR NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" BIGSERIAL NOT NULL,
    "address" VARCHAR NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_organizations" (
    "id" BIGSERIAL NOT NULL,
    "contactId" BIGINT NOT NULL,
    "organizationId" BIGINT NOT NULL,

    CONSTRAINT "contact_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_phone_numbers" (
    "id" BIGSERIAL NOT NULL,
    "contactId" BIGINT NOT NULL,
    "phoneNumberId" BIGINT NOT NULL,

    CONSTRAINT "contact_phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_occupations" (
    "id" BIGSERIAL NOT NULL,
    "contactId" BIGINT NOT NULL,
    "occupationId" BIGINT NOT NULL,

    CONSTRAINT "contact_occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_photos" (
    "id" BIGSERIAL NOT NULL,
    "contactId" BIGINT NOT NULL,
    "photoId" BIGINT NOT NULL,

    CONSTRAINT "contact_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_addresses" (
    "id" BIGSERIAL NOT NULL,
    "contactId" BIGINT NOT NULL,
    "addressId" BIGINT NOT NULL,

    CONSTRAINT "contact_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_emails" (
    "id" BIGSERIAL NOT NULL,
    "contactId" BIGINT NOT NULL,
    "emailId" BIGINT NOT NULL,

    CONSTRAINT "contact_emails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_organizations" ADD CONSTRAINT "contact_organizations_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_organizations" ADD CONSTRAINT "contact_organizations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_phone_numbers" ADD CONSTRAINT "contact_phone_numbers_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_phone_numbers" ADD CONSTRAINT "contact_phone_numbers_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "phone_numbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_occupations" ADD CONSTRAINT "contact_occupations_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_occupations" ADD CONSTRAINT "contact_occupations_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_photos" ADD CONSTRAINT "contact_photos_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_photos" ADD CONSTRAINT "contact_photos_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_addresses" ADD CONSTRAINT "contact_addresses_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_addresses" ADD CONSTRAINT "contact_addresses_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_emails" ADD CONSTRAINT "contact_emails_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_emails" ADD CONSTRAINT "contact_emails_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
