-- CreateTable
CREATE TABLE "home_base" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "coords" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "home_base_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "home_base" ADD CONSTRAINT "home_base_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
