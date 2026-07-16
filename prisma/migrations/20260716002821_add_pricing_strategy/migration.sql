-- CreateTable
CREATE TABLE "PricingStrategy" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "morningConciergeFee" DECIMAL(10,2) NOT NULL,
    "eveningConciergeFee" DECIMAL(10,2) NOT NULL,
    "dualConciergeFee" DECIMAL(10,2) NOT NULL,
    "serviceAllocationMode" TEXT NOT NULL,
    "fixedServiceAllocation" DECIMAL(10,2) NOT NULL,
    "serviceAllocationPercent" DECIMAL(5,4) NOT NULL,
    "inventoryBufferPercent" DECIMAL(5,4) NOT NULL,
    "supplementMarginPercent" DECIMAL(5,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingStrategy_pkey" PRIMARY KEY ("id")
);
