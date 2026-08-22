-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "Tenant" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "stripeSubscriptionId" TEXT;
