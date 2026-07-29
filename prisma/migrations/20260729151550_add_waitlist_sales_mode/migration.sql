-- CreateEnum
CREATE TYPE "VidaPouchSalesMode" AS ENUM ('STRIPE', 'WAITLIST', 'PAUSED');

-- CreateEnum
CREATE TYPE "VidaPouchWaitlistStatus" AS ENUM ('NEW', 'CONTACTED', 'READY_TO_ORDER', 'CONVERTED', 'DECLINED');

-- CreateTable
CREATE TABLE "VidaPouchCommerceSetting" (
    "id" TEXT NOT NULL,
    "salesMode" "VidaPouchSalesMode" NOT NULL DEFAULT 'WAITLIST',
    "updatedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchCommerceSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchWaitlistEntry" (
    "id" TEXT NOT NULL,
    "status" "VidaPouchWaitlistStatus" NOT NULL DEFAULT 'NEW',
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "purchaseOption" "VidaPouchPurchaseOption" NOT NULL,
    "planKey" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "supplementCount" INTEGER NOT NULL,
    "estimatedPlanPrice" DECIMAL(10,2) NOT NULL,
    "estimatedOverageFee" DECIMAL(10,2) NOT NULL,
    "estimatedTotalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "pricingVersionId" TEXT,
    "pricingCalculatedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "contactedAt" TIMESTAMP(3),
    "readyToOrderAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchWaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchWaitlistItem" (
    "id" TEXT NOT NULL,
    "waitlistEntryId" TEXT NOT NULL,
    "pouchItemId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "retailer" TEXT NOT NULL,
    "dosage" TEXT,
    "form" TEXT,
    "unitLabel" TEXT NOT NULL,
    "unitsPerDay" DECIMAL(10,2) NOT NULL,
    "monthlyUnitCount" DECIMAL(10,2) NOT NULL,
    "timing" TEXT NOT NULL,
    "timingPreference" TEXT NOT NULL,
    "bottlePrice" DECIMAL(10,2) NOT NULL,
    "bottleUnitCount" INTEGER NOT NULL,
    "liveProductUrl" TEXT,
    "shoppingProductId" TEXT,
    "immersiveProductPageToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchWaitlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VidaPouchWaitlistEntry_status_idx" ON "VidaPouchWaitlistEntry"("status");

-- CreateIndex
CREATE INDEX "VidaPouchWaitlistEntry_customerEmail_idx" ON "VidaPouchWaitlistEntry"("customerEmail");

-- CreateIndex
CREATE INDEX "VidaPouchWaitlistEntry_createdAt_idx" ON "VidaPouchWaitlistEntry"("createdAt");

-- CreateIndex
CREATE INDEX "VidaPouchWaitlistItem_waitlistEntryId_idx" ON "VidaPouchWaitlistItem"("waitlistEntryId");

-- CreateIndex
CREATE INDEX "VidaPouchWaitlistItem_shoppingProductId_idx" ON "VidaPouchWaitlistItem"("shoppingProductId");

-- AddForeignKey
ALTER TABLE "VidaPouchWaitlistItem" ADD CONSTRAINT "VidaPouchWaitlistItem_waitlistEntryId_fkey" FOREIGN KEY ("waitlistEntryId") REFERENCES "VidaPouchWaitlistEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
