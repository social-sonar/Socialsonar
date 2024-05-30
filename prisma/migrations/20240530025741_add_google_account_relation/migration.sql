-- CreateTable
CREATE TABLE "google_account" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_google_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_google_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_account_googleId_key" ON "google_account"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "google_account_email_key" ON "google_account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_account_userId_googleAccountId_key" ON "user_google_account"("userId", "googleAccountId");

-- AddForeignKey
ALTER TABLE "user_google_account" ADD CONSTRAINT "user_google_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_google_account" ADD CONSTRAINT "user_google_account_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "google_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
