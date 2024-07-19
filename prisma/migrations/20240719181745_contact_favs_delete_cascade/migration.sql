-- DropForeignKey
ALTER TABLE "contact_user_fav" DROP CONSTRAINT "contact_user_fav_userId_fkey";

-- AddForeignKey
ALTER TABLE "contact_user_fav" ADD CONSTRAINT "contact_user_fav_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
