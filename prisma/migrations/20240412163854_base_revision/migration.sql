-- CreateEnum
CREATE TYPE "PhoneNumberType" AS ENUM ('CELL', 'HOME', 'WORK');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "nickName" VARCHAR,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" SERIAL NOT NULL,
    "number" VARCHAR NOT NULL,
    "type" "PhoneNumberType" NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "countryCode" VARCHAR,
    "city" VARCHAR,
    "region" VARCHAR,
    "postalCode" VARCHAR,
    "streetAddress" VARCHAR,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_organizations" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "contact_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_phone_numbers" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "phoneNumberId" INTEGER NOT NULL,

    CONSTRAINT "contact_phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_occupations" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "occupationId" INTEGER NOT NULL,

    CONSTRAINT "contact_occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_photos" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,

    CONSTRAINT "contact_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_addresses" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "contact_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_emails" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "emailId" INTEGER NOT NULL,

    CONSTRAINT "contact_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contact_organizations_contactId_organizationId_key" ON "contact_organizations"("contactId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_phone_numbers_contactId_phoneNumberId_key" ON "contact_phone_numbers"("contactId", "phoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_occupations_contactId_occupationId_key" ON "contact_occupations"("contactId", "occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_photos_contactId_photoId_key" ON "contact_photos"("contactId", "photoId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_addresses_contactId_addressId_key" ON "contact_addresses"("contactId", "addressId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_emails_contactId_emailId_key" ON "contact_emails"("contactId", "emailId");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
