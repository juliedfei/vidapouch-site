-- CreateEnum
CREATE TYPE "VidaPouchFulfillmentStatus" AS ENUM ('NEW', 'PREPARING', 'PACKED', 'SHIPPED', 'COMPLETED', 'ON_HOLD');

-- AlterTable
ALTER TABLE "VidaPouchOrder" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "fulfillmentNotes" TEXT,
ADD COLUMN     "fulfillmentStatus" "VidaPouchFulfillmentStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "onHoldAt" TIMESTAMP(3),
ADD COLUMN     "packedAt" TIMESTAMP(3),
ADD COLUMN     "preparingAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingCarrier" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- CreateIndex
CREATE INDEX "VidaPouchOrder_fulfillmentStatus_idx" ON "VidaPouchOrder"("fulfillmentStatus");
