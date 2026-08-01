-- AlterTable
ALTER TABLE "VidaPouchFulfillmentRun" ADD COLUMN     "fulfillmentStatus" "VidaPouchFulfillmentStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "onHoldAt" TIMESTAMP(3),
ADD COLUMN     "packedAt" TIMESTAMP(3),
ADD COLUMN     "preparingAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingCarrier" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- CreateIndex
CREATE INDEX "VidaPouchFulfillmentRun_fulfillmentStatus_idx" ON "VidaPouchFulfillmentRun"("fulfillmentStatus");
