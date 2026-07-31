-- CreateEnum
CREATE TYPE "VidaPouchFulfillmentRunStatus" AS ENUM ('PENDING', 'INVENTORY_RESERVED', 'ASSEMBLING', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "VidaPouchFulfillmentRun" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "billingCycleId" TEXT,
    "status" "VidaPouchFulfillmentRunStatus" NOT NULL DEFAULT 'PENDING',
    "revenueAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "inventoryReservedAt" TIMESTAMP(3),
    "assemblingAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchFulfillmentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchInventoryAllocation" (
    "id" TEXT NOT NULL,
    "fulfillmentRunId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCostSnapshot" DECIMAL(12,6) NOT NULL,
    "totalCostSnapshot" DECIMAL(10,2) NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchInventoryAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchFulfillmentRun_billingCycleId_key" ON "VidaPouchFulfillmentRun"("billingCycleId");

-- CreateIndex
CREATE INDEX "VidaPouchFulfillmentRun_orderId_idx" ON "VidaPouchFulfillmentRun"("orderId");

-- CreateIndex
CREATE INDEX "VidaPouchFulfillmentRun_status_idx" ON "VidaPouchFulfillmentRun"("status");

-- CreateIndex
CREATE INDEX "VidaPouchFulfillmentRun_createdAt_idx" ON "VidaPouchFulfillmentRun"("createdAt");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryAllocation_fulfillmentRunId_idx" ON "VidaPouchInventoryAllocation"("fulfillmentRunId");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryAllocation_orderItemId_idx" ON "VidaPouchInventoryAllocation"("orderItemId");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryAllocation_bottleId_idx" ON "VidaPouchInventoryAllocation"("bottleId");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryAllocation_createdAt_idx" ON "VidaPouchInventoryAllocation"("createdAt");

-- AddForeignKey
ALTER TABLE "VidaPouchFulfillmentRun" ADD CONSTRAINT "VidaPouchFulfillmentRun_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "VidaPouchOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VidaPouchFulfillmentRun" ADD CONSTRAINT "VidaPouchFulfillmentRun_billingCycleId_fkey" FOREIGN KEY ("billingCycleId") REFERENCES "VidaPouchBillingCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VidaPouchInventoryAllocation" ADD CONSTRAINT "VidaPouchInventoryAllocation_fulfillmentRunId_fkey" FOREIGN KEY ("fulfillmentRunId") REFERENCES "VidaPouchFulfillmentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VidaPouchInventoryAllocation" ADD CONSTRAINT "VidaPouchInventoryAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "VidaPouchOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VidaPouchInventoryAllocation" ADD CONSTRAINT "VidaPouchInventoryAllocation_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "VidaPouchInventoryBottle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
