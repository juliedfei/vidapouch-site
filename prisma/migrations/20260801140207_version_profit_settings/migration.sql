-- AlterTable
ALTER TABLE "VidaPouchProfitSettings" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "retiredAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "VidaPouchProfitSettings_active_idx" ON "VidaPouchProfitSettings"("active");

-- CreateIndex
CREATE INDEX "VidaPouchProfitSettings_effectiveFrom_idx" ON "VidaPouchProfitSettings"("effectiveFrom");
