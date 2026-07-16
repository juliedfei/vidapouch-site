-- CreateEnum
CREATE TYPE "ProductResearchStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ProductResearchCache" (
    "id" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "requestedProductName" TEXT NOT NULL,
    "canonicalProductName" TEXT,
    "brand" TEXT,
    "supplement" TEXT,
    "research" JSONB,
    "status" "ProductResearchStatus" NOT NULL DEFAULT 'PENDING',
    "aiConfidence" DECIMAL(5,4),
    "sourceProvider" TEXT NOT NULL DEFAULT 'openai',
    "modelName" TEXT,
    "methodologyVersion" TEXT NOT NULL DEFAULT 'product-research-v1',
    "researchedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductResearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductResearchCache_normalizedKey_key" ON "ProductResearchCache"("normalizedKey");

-- CreateIndex
CREATE INDEX "ProductResearchCache_status_idx" ON "ProductResearchCache"("status");

-- CreateIndex
CREATE INDEX "ProductResearchCache_expiresAt_idx" ON "ProductResearchCache"("expiresAt");

-- CreateIndex
CREATE INDEX "ProductResearchCache_brand_supplement_idx" ON "ProductResearchCache"("brand", "supplement");

-- CreateIndex
CREATE INDEX "ProductResearchCache_updatedAt_idx" ON "ProductResearchCache"("updatedAt");
