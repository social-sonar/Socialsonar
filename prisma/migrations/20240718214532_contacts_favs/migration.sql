-- CreateTable
CREATE TABLE "contact_user_fav" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_user_fav_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_user_fav_contactId_userId_key" ON "contact_user_fav"("contactId", "userId");

-- AddForeignKey
ALTER TABLE "contact_user_fav" ADD CONSTRAINT "contact_user_fav_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_user_fav" ADD CONSTRAINT "contact_user_fav_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
