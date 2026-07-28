-- CreateEnum
CREATE TYPE "VidaPouchPurchaseOption" AS ENUM ('ONE_TIME', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "VidaPouchOrderStatus" AS ENUM ('PENDING', 'PAID', 'PAYMENT_FAILED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "VidaPouchWebhookStatus" AS ENUM ('PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "VidaPouchOrder" (
    "id" TEXT NOT NULL,
    "purchaseOption" "VidaPouchPurchaseOption" NOT NULL,
    "status" "VidaPouchOrderStatus" NOT NULL DEFAULT 'PENDING',
    "planKey" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "supplementCount" INTEGER NOT NULL,
    "planPrice" DECIMAL(10,2) NOT NULL,
    "planOverageFee" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "pricingVersionId" TEXT,
    "pricingCalculatedAt" TIMESTAMP(3),
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "shippingName" TEXT,
    "shippingAddress" JSONB,
    "paidAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
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

    CONSTRAINT "VidaPouchOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchWebhookEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "VidaPouchWebhookStatus" NOT NULL DEFAULT 'PROCESSING',
    "payload" JSONB NOT NULL,
    "processingAttempts" INTEGER NOT NULL DEFAULT 1,
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchOrder_stripeCheckoutSessionId_key" ON "VidaPouchOrder"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchOrder_stripePaymentIntentId_key" ON "VidaPouchOrder"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchOrder_stripeSubscriptionId_key" ON "VidaPouchOrder"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "VidaPouchOrder_status_idx" ON "VidaPouchOrder"("status");

-- CreateIndex
CREATE INDEX "VidaPouchOrder_purchaseOption_idx" ON "VidaPouchOrder"("purchaseOption");

-- CreateIndex
CREATE INDEX "VidaPouchOrder_stripeCustomerId_idx" ON "VidaPouchOrder"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "VidaPouchOrder_customerEmail_idx" ON "VidaPouchOrder"("customerEmail");

-- CreateIndex
CREATE INDEX "VidaPouchOrder_createdAt_idx" ON "VidaPouchOrder"("createdAt");

-- CreateIndex
CREATE INDEX "VidaPouchOrderItem_orderId_idx" ON "VidaPouchOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "VidaPouchOrderItem_shoppingProductId_idx" ON "VidaPouchOrderItem"("shoppingProductId");

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchWebhookEvent_stripeEventId_key" ON "VidaPouchWebhookEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "VidaPouchWebhookEvent_eventType_idx" ON "VidaPouchWebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "VidaPouchWebhookEvent_status_idx" ON "VidaPouchWebhookEvent"("status");

-- CreateIndex
CREATE INDEX "VidaPouchWebhookEvent_createdAt_idx" ON "VidaPouchWebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "VidaPouchOrderItem" ADD CONSTRAINT "VidaPouchOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "VidaPouchOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
