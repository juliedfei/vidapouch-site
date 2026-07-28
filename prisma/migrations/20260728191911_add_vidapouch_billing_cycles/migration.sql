-- CreateTable
CREATE TABLE "VidaPouchBillingCycle" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" "VidaPouchOrderStatus" NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "billingReason" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchBillingCycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchBillingCycle_stripeInvoiceId_key" ON "VidaPouchBillingCycle"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "VidaPouchBillingCycle_orderId_idx" ON "VidaPouchBillingCycle"("orderId");

-- CreateIndex
CREATE INDEX "VidaPouchBillingCycle_status_idx" ON "VidaPouchBillingCycle"("status");

-- CreateIndex
CREATE INDEX "VidaPouchBillingCycle_createdAt_idx" ON "VidaPouchBillingCycle"("createdAt");

-- AddForeignKey
ALTER TABLE "VidaPouchBillingCycle" ADD CONSTRAINT "VidaPouchBillingCycle_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "VidaPouchOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
