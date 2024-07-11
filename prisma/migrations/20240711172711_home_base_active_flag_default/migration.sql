-- AlterTable
ALTER TABLE "home_base" ALTER COLUMN "active" DROP NOT NULL,
ALTER COLUMN "active" SET DEFAULT false;
