-- CreateEnum
CREATE TYPE "ContactMergeStatus" AS ENUM ('MERGED_BETWEEN', 'SINGLE_CHOICE', 'PENDING');

-- CreateTable
CREATE TABLE "contact_status" (
    "id" SERIAL NOT NULL,
    "firstContactId" INTEGER NOT NULL,
    "secondContactId" INTEGER NOT NULL,
    "finalContactId" INTEGER,
    "mergeStatus" "ContactMergeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_status" ADD CONSTRAINT "contact_status_firstContactId_fkey" FOREIGN KEY ("firstContactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_status" ADD CONSTRAINT "contact_status_secondContactId_fkey" FOREIGN KEY ("secondContactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_status" ADD CONSTRAINT "contact_status_finalContactId_fkey" FOREIGN KEY ("finalContactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
