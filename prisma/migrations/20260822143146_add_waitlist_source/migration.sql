-- CreateEnum
CREATE TYPE "VidaPouchWaitlistSource" AS ENUM ('VIDASEARCH', 'VIDAPOUCH');

-- AlterTable
ALTER TABLE "VidaPouchWaitlistEntry" ADD COLUMN     "source" "VidaPouchWaitlistSource" NOT NULL DEFAULT 'VIDASEARCH',
ALTER COLUMN "purchaseOption" DROP NOT NULL,
ALTER COLUMN "planKey" DROP NOT NULL,
ALTER COLUMN "planName" DROP NOT NULL,
ALTER COLUMN "supplementCount" DROP NOT NULL,
ALTER COLUMN "estimatedPlanPrice" DROP NOT NULL,
ALTER COLUMN "estimatedOverageFee" DROP NOT NULL,
ALTER COLUMN "estimatedTotalPrice" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "VidaPouchWaitlistEntry_source_idx" ON "VidaPouchWaitlistEntry"("source");
