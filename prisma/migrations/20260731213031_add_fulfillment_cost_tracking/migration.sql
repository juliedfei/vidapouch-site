-- CreateEnum
CREATE TYPE "VidaPouchFulfillmentCostType" AS ENUM ('PACKAGING', 'SHIPPING', 'PAYMENT_PROCESSING', 'OTHER');

-- CreateTable
CREATE TABLE "VidaPouchFulfillmentCost" (
    "id" TEXT NOT NULL,
    "fulfillmentRunId" TEXT NOT NULL,
    "costType" "VidaPouchFulfillmentCostType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchFulfillmentCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VidaPouchFulfillmentCost_fulfillmentRunId_idx" ON "VidaPouchFulfillmentCost"("fulfillmentRunId");

-- CreateIndex
CREATE INDEX "VidaPouchFulfillmentCost_costType_idx" ON "VidaPouchFulfillmentCost"("costType");

-- CreateIndex
CREATE INDEX "VidaPouchFulfillmentCost_createdAt_idx" ON "VidaPouchFulfillmentCost"("createdAt");

-- AddForeignKey
ALTER TABLE "VidaPouchFulfillmentCost" ADD CONSTRAINT "VidaPouchFulfillmentCost_fulfillmentRunId_fkey" FOREIGN KEY ("fulfillmentRunId") REFERENCES "VidaPouchFulfillmentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
