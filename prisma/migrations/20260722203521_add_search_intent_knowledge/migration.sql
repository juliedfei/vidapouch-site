-- CreateEnum
CREATE TYPE "SearchIntentType" AS ENUM ('SUPPLEMENT', 'HEALTH_GOAL', 'BRAND', 'DOCTOR_TYPE', 'INVALID');

-- CreateEnum
CREATE TYPE "SearchIntentSource" AS ENUM ('MANUAL', 'OPENAI', 'IMPORTED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SearchIntentReviewStatus" AS ENUM ('ACTIVE', 'NEEDS_REVIEW', 'REJECTED', 'RETIRED');

-- CreateEnum
CREATE TYPE "SearchExpansionKind" AS ENUM ('DIRECT_QUERY', 'RELATED_SUPPLEMENT', 'BRAND_QUERY', 'DOCTOR_QUERY');

-- CreateTable
CREATE TABLE "SearchIntent" (
    "id" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "intentType" "SearchIntentType" NOT NULL,
    "source" "SearchIntentSource" NOT NULL DEFAULT 'MANUAL',
    "reviewStatus" "SearchIntentReviewStatus" NOT NULL DEFAULT 'ACTIVE',
    "confidence" DECIMAL(5,4),
    "sourceModel" TEXT,
    "methodologyVersion" TEXT NOT NULL DEFAULT 'search-intent-v1',
    "includeOriginalMarketplaceQuery" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIntentAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "source" "SearchIntentSource" NOT NULL DEFAULT 'MANUAL',
    "confidence" DECIMAL(5,4),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchIntentAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIntentExpansion" (
    "id" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "expansionKind" "SearchExpansionKind" NOT NULL,
    "searchTerm" TEXT NOT NULL,
    "normalizedSearchTerm" TEXT NOT NULL,
    "displayName" TEXT,
    "reason" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" "SearchIntentSource" NOT NULL DEFAULT 'MANUAL',
    "confidence" DECIMAL(5,4),
    "supplementId" TEXT,
    "brandId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchIntentExpansion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchIntent_normalizedKey_key" ON "SearchIntent"("normalizedKey");

-- CreateIndex
CREATE INDEX "SearchIntent_intentType_idx" ON "SearchIntent"("intentType");

-- CreateIndex
CREATE INDEX "SearchIntent_reviewStatus_idx" ON "SearchIntent"("reviewStatus");

-- CreateIndex
CREATE INDEX "SearchIntent_source_idx" ON "SearchIntent"("source");

-- CreateIndex
CREATE INDEX "SearchIntent_expiresAt_idx" ON "SearchIntent"("expiresAt");

-- CreateIndex
CREATE INDEX "SearchIntent_lastUsedAt_idx" ON "SearchIntent"("lastUsedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIntentAlias_normalizedAlias_key" ON "SearchIntentAlias"("normalizedAlias");

-- CreateIndex
CREATE INDEX "SearchIntentAlias_intentId_idx" ON "SearchIntentAlias"("intentId");

-- CreateIndex
CREATE INDEX "SearchIntentAlias_active_idx" ON "SearchIntentAlias"("active");

-- CreateIndex
CREATE INDEX "SearchIntentExpansion_intentId_idx" ON "SearchIntentExpansion"("intentId");

-- CreateIndex
CREATE INDEX "SearchIntentExpansion_intentId_active_priority_idx" ON "SearchIntentExpansion"("intentId", "active", "priority");

-- CreateIndex
CREATE INDEX "SearchIntentExpansion_expansionKind_idx" ON "SearchIntentExpansion"("expansionKind");

-- CreateIndex
CREATE INDEX "SearchIntentExpansion_supplementId_idx" ON "SearchIntentExpansion"("supplementId");

-- CreateIndex
CREATE INDEX "SearchIntentExpansion_brandId_idx" ON "SearchIntentExpansion"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIntentExpansion_intentId_expansionKind_normalizedSear_key" ON "SearchIntentExpansion"("intentId", "expansionKind", "normalizedSearchTerm");

-- AddForeignKey
ALTER TABLE "SearchIntentAlias" ADD CONSTRAINT "SearchIntentAlias_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "SearchIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchIntentExpansion" ADD CONSTRAINT "SearchIntentExpansion_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "SearchIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchIntentExpansion" ADD CONSTRAINT "SearchIntentExpansion_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchIntentExpansion" ADD CONSTRAINT "SearchIntentExpansion_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
