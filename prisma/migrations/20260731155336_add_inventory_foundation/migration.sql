-- CreateEnum
CREATE TYPE "VidaPouchInventoryBottleStatus" AS ENUM ('QUARANTINED', 'AVAILABLE', 'LOW_STOCK', 'DEPLETED', 'EXPIRED', 'RECALLED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "VidaPouchInventoryMovementType" AS ENUM ('RECEIVED', 'RESERVED', 'RELEASED', 'CONSUMED', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DISCARDED', 'RECALL_HOLD');

-- CreateTable
CREATE TABLE "VidaPouchInventoryProduct" (
    "id" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "dosage" TEXT,
    "form" TEXT,
    "unitLabel" TEXT NOT NULL,
    "shoppingProductId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "reorderThreshold" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchInventoryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchInventoryBottle" (
    "id" TEXT NOT NULL,
    "bottleCode" TEXT NOT NULL,
    "inventoryProductId" TEXT NOT NULL,
    "manufacturerLotNumber" TEXT,
    "expirationDate" TIMESTAMP(3),
    "supplier" TEXT,
    "supplierOrderNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "status" "VidaPouchInventoryBottleStatus" NOT NULL DEFAULT 'QUARANTINED',
    "bottleCost" DECIMAL(10,2) NOT NULL,
    "allocatedShippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "allocatedTaxCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "landedCost" DECIMAL(10,2) NOT NULL,
    "originalUnitCount" DECIMAL(10,2) NOT NULL,
    "remainingUnitCount" DECIMAL(10,2) NOT NULL,
    "reservedUnitCount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "storageLocation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchInventoryBottle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchInventoryMovement" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "movementType" "VidaPouchInventoryMovementType" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "reason" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VidaPouchInventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchInventoryProduct_normalizedKey_key" ON "VidaPouchInventoryProduct"("normalizedKey");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryProduct_brand_idx" ON "VidaPouchInventoryProduct"("brand");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryProduct_productName_idx" ON "VidaPouchInventoryProduct"("productName");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryProduct_shoppingProductId_idx" ON "VidaPouchInventoryProduct"("shoppingProductId");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryProduct_active_idx" ON "VidaPouchInventoryProduct"("active");

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchInventoryBottle_bottleCode_key" ON "VidaPouchInventoryBottle"("bottleCode");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryBottle_inventoryProductId_idx" ON "VidaPouchInventoryBottle"("inventoryProductId");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryBottle_status_idx" ON "VidaPouchInventoryBottle"("status");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryBottle_manufacturerLotNumber_idx" ON "VidaPouchInventoryBottle"("manufacturerLotNumber");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryBottle_expirationDate_idx" ON "VidaPouchInventoryBottle"("expirationDate");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryBottle_receivedAt_idx" ON "VidaPouchInventoryBottle"("receivedAt");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryMovement_bottleId_idx" ON "VidaPouchInventoryMovement"("bottleId");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryMovement_movementType_idx" ON "VidaPouchInventoryMovement"("movementType");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryMovement_referenceType_referenceId_idx" ON "VidaPouchInventoryMovement"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "VidaPouchInventoryMovement_createdAt_idx" ON "VidaPouchInventoryMovement"("createdAt");

-- AddForeignKey
ALTER TABLE "VidaPouchInventoryBottle" ADD CONSTRAINT "VidaPouchInventoryBottle_inventoryProductId_fkey" FOREIGN KEY ("inventoryProductId") REFERENCES "VidaPouchInventoryProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VidaPouchInventoryMovement" ADD CONSTRAINT "VidaPouchInventoryMovement_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "VidaPouchInventoryBottle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
