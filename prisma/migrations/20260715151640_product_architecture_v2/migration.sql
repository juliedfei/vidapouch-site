/*
  Warnings:

  - You are about to drop the column `manufacturer` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `thirdPartyTested` on the `Brand` table. All the data in the column will be lost.
  - The primary key for the `ProductCertification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `retailProductId` on the `ProductCertification` table. All the data in the column will be lost.
  - You are about to drop the column `reputationWeight` on the `RecommendationWeightSet` table. All the data in the column will be lost.
  - You are about to drop the `BrandScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailPriceSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `ProductCertification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataCompletenessWeight` to the `RecommendationWeightSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosageFitWeight` to the `RecommendationWeightSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewWeight` to the `RecommendationWeightSet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AmountBasis" AS ENUM ('CAPSULE', 'TABLET', 'SOFTGEL', 'CAPLET', 'SERVING', 'CONTAINER');

-- CreateEnum
CREATE TYPE "RetailerType" AS ENUM ('MARKETPLACE', 'MASS_RETAIL', 'PHARMACY', 'SPECIALTY', 'CLUB', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceSourceType" AS ENUM ('OFFICIAL_BRAND', 'CERTIFICATION_DATABASE', 'REGULATORY_SOURCE', 'RETAILER_LISTING', 'SCIENTIFIC_PAPER', 'MANUAL_RESEARCH', 'AI_DISCOVERY', 'OTHER');

-- CreateEnum
CREATE TYPE "DiscoveryStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "DiscoveryCandidateType" AS ENUM ('BRAND', 'BRAND_ALIAS', 'MANUFACTURER', 'SUPPLEMENT', 'SUPPLEMENT_ALIAS', 'PRODUCT', 'RETAIL_LISTING', 'PRICE_CHANGE', 'REVIEW_CHANGE', 'CERTIFICATION', 'AVAILABILITY_CHANGE');

-- CreateEnum
CREATE TYPE "CandidateReviewStatus" AS ENUM ('PENDING', 'AUTO_APPROVED', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "RefreshJobType" AS ENUM ('DISCOVER_BRANDS', 'DISCOVER_PRODUCTS', 'REFRESH_LISTING', 'REFRESH_PRICE', 'REFRESH_REVIEWS', 'VERIFY_CERTIFICATION', 'VERIFY_BRAND', 'VERIFY_PRODUCT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "DataConfidence" ADD VALUE 'INFERRED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RecommendationMode" ADD VALUE 'BEST_VALUE';
ALTER TYPE "RecommendationMode" ADD VALUE 'PRACTITIONER_FOCUS';

-- DropForeignKey
ALTER TABLE "BrandScore" DROP CONSTRAINT "BrandScore_brandId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCertification" DROP CONSTRAINT "ProductCertification_retailProductId_fkey";

-- DropForeignKey
ALTER TABLE "RetailPriceSnapshot" DROP CONSTRAINT "RetailPriceSnapshot_retailProductId_fkey";

-- DropForeignKey
ALTER TABLE "RetailProduct" DROP CONSTRAINT "RetailProduct_brandId_fkey";

-- DropForeignKey
ALTER TABLE "RetailProduct" DROP CONSTRAINT "RetailProduct_retailerId_fkey";

-- DropForeignKey
ALTER TABLE "RetailProduct" DROP CONSTRAINT "RetailProduct_supplementId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "manufacturer",
DROP COLUMN "thirdPartyTested",
ADD COLUMN     "manufacturerId" TEXT,
ADD COLUMN     "thirdPartyTestingProgram" BOOLEAN;

-- AlterTable
ALTER TABLE "BrandAlias" ADD COLUMN     "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "BrandCertification" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ProductCertification" DROP CONSTRAINT "ProductCertification_pkey",
DROP COLUMN "retailProductId",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "productId" TEXT NOT NULL,
ADD CONSTRAINT "ProductCertification_pkey" PRIMARY KEY ("productId", "certificationId");

-- AlterTable
ALTER TABLE "RecommendationWeightSet" DROP COLUMN "reputationWeight",
ADD COLUMN     "dataCompletenessWeight" INTEGER NOT NULL,
ADD COLUMN     "dosageFitWeight" INTEGER NOT NULL,
ADD COLUMN     "reviewWeight" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Retailer" ADD COLUMN     "reliabilityScore" INTEGER,
ADD COLUMN     "retailerType" "RetailerType" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Supplement" ADD COLUMN     "defaultUnit" TEXT;

-- AlterTable
ALTER TABLE "SupplementAlias" ADD COLUMN     "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "source" TEXT;

-- DropTable
DROP TABLE "BrandScore";

-- DropTable
DROP TABLE "RetailPriceSnapshot";

-- DropTable
DROP TABLE "RetailProduct";

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "website" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "canonicalTitle" TEXT NOT NULL,
    "manufacturerSku" TEXT,
    "upc" TEXT,
    "brandId" TEXT NOT NULL,
    "form" "ProductForm",
    "unitsPerContainer" INTEGER,
    "servingSize" DECIMAL(10,2),
    "servingsPerContainer" DECIMAL(10,2),
    "productUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductIngredient" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "amount" DECIMAL(12,4),
    "unit" TEXT,
    "amountBasis" "AmountBasis",
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailerAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailListing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "externalListingId" TEXT,
    "listingTitle" TEXT NOT NULL,
    "url" TEXT,
    "currentBottlePrice" DECIMAL(10,2),
    "currentShipping" DECIMAL(10,2) DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "inStock" BOOLEAN,
    "availabilityText" TEXT,
    "sellerName" TEXT,
    "sellerVerified" BOOLEAN,
    "sourceProvider" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "retailListingId" TEXT NOT NULL,
    "bottlePrice" DECIMAL(10,2) NOT NULL,
    "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "landedPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "inStock" BOOLEAN,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSnapshot" (
    "id" TEXT NOT NULL,
    "retailListingId" TEXT NOT NULL,
    "averageRating" DECIMAL(4,2),
    "reviewCount" INTEGER,
    "ratingScale" DECIMAL(4,2) NOT NULL DEFAULT 5,
    "sourceUrl" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewInsight" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "retailListingId" TEXT,
    "positiveThemes" TEXT[],
    "negativeThemes" TEXT[],
    "commonComplaints" TEXT[],
    "commonBenefits" TEXT[],
    "sentimentScore" DECIMAL(5,2),
    "reviewSampleSize" INTEGER,
    "methodologyVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceSource" (
    "id" TEXT NOT NULL,
    "sourceType" "EvidenceSourceType" NOT NULL,
    "publisher" TEXT,
    "title" TEXT,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authoritative" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandEvidence" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "evidenceSourceId" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "claimValue" TEXT,
    "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManufacturerEvidence" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "evidenceSourceId" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "claimValue" TEXT,
    "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManufacturerEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementEvidence" (
    "id" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "evidenceSourceId" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "claimValue" TEXT,
    "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductEvidence" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "evidenceSourceId" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "claimValue" TEXT,
    "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatoryEvent" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT,
    "occurredAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegulatoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandScoreSnapshot" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "mode" "RecommendationMode" NOT NULL,
    "qualityScore" INTEGER NOT NULL,
    "testingScore" INTEGER NOT NULL,
    "evidenceScore" INTEGER NOT NULL,
    "reputationScore" INTEGER NOT NULL,
    "availabilityScore" INTEGER NOT NULL,
    "dataCompletenessScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductScoreSnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mode" "RecommendationMode" NOT NULL,
    "qualityScore" INTEGER NOT NULL,
    "testingScore" INTEGER NOT NULL,
    "evidenceScore" INTEGER NOT NULL,
    "reviewScore" INTEGER NOT NULL,
    "reviewConfidenceScore" INTEGER NOT NULL,
    "dosageFitScore" INTEGER NOT NULL,
    "valueScore" INTEGER NOT NULL,
    "availabilityScore" INTEGER NOT NULL,
    "dataCompletenessScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingScoreSnapshot" (
    "id" TEXT NOT NULL,
    "retailListingId" TEXT NOT NULL,
    "priceScore" INTEGER NOT NULL,
    "sellerConfidenceScore" INTEGER NOT NULL,
    "shippingScore" INTEGER NOT NULL,
    "availabilityScore" INTEGER NOT NULL,
    "freshnessScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryRun" (
    "id" TEXT NOT NULL,
    "status" "DiscoveryStatus" NOT NULL DEFAULT 'RUNNING',
    "sourceProvider" TEXT NOT NULL,
    "searchScope" TEXT,
    "recordsDiscovered" INTEGER NOT NULL DEFAULT 0,
    "recordsAccepted" INTEGER NOT NULL DEFAULT 0,
    "recordsRejected" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryCandidate" (
    "id" TEXT NOT NULL,
    "discoveryRunId" TEXT NOT NULL,
    "candidateType" "DiscoveryCandidateType" NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "normalizedPayload" JSONB,
    "confidenceScore" INTEGER,
    "status" "CandidateReviewStatus" NOT NULL DEFAULT 'PENDING',
    "matchedEntityType" TEXT,
    "matchedEntityId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeRefreshJob" (
    "id" TEXT NOT NULL,
    "jobType" "RefreshJobType" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "scheduledFor" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeRefreshJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_canonicalName_key" ON "Manufacturer"("canonicalName");

-- CreateIndex
CREATE UNIQUE INDEX "Product_upc_key" ON "Product"("upc");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_brandId_canonicalTitle_idx" ON "Product"("brandId", "canonicalTitle");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE INDEX "Product_manufacturerSku_idx" ON "Product"("manufacturerSku");

-- CreateIndex
CREATE INDEX "ProductIngredient_productId_idx" ON "ProductIngredient"("productId");

-- CreateIndex
CREATE INDEX "ProductIngredient_supplementId_idx" ON "ProductIngredient"("supplementId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductIngredient_productId_supplementId_amountBasis_key" ON "ProductIngredient"("productId", "supplementId", "amountBasis");

-- CreateIndex
CREATE UNIQUE INDEX "RetailerAlias_normalizedAlias_key" ON "RetailerAlias"("normalizedAlias");

-- CreateIndex
CREATE INDEX "RetailerAlias_retailerId_idx" ON "RetailerAlias"("retailerId");

-- CreateIndex
CREATE INDEX "RetailListing_productId_idx" ON "RetailListing"("productId");

-- CreateIndex
CREATE INDEX "RetailListing_retailerId_idx" ON "RetailListing"("retailerId");

-- CreateIndex
CREATE INDEX "RetailListing_productId_retailerId_idx" ON "RetailListing"("productId", "retailerId");

-- CreateIndex
CREATE INDEX "RetailListing_externalListingId_idx" ON "RetailListing"("externalListingId");

-- CreateIndex
CREATE INDEX "RetailListing_active_lastSeenAt_idx" ON "RetailListing"("active", "lastSeenAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_retailListingId_idx" ON "PriceSnapshot"("retailListingId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_retailListingId_capturedAt_idx" ON "PriceSnapshot"("retailListingId", "capturedAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_capturedAt_idx" ON "PriceSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "ReviewSnapshot_retailListingId_idx" ON "ReviewSnapshot"("retailListingId");

-- CreateIndex
CREATE INDEX "ReviewSnapshot_retailListingId_capturedAt_idx" ON "ReviewSnapshot"("retailListingId", "capturedAt");

-- CreateIndex
CREATE INDEX "ReviewSnapshot_capturedAt_idx" ON "ReviewSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "ReviewInsight_productId_idx" ON "ReviewInsight"("productId");

-- CreateIndex
CREATE INDEX "ReviewInsight_retailListingId_idx" ON "ReviewInsight"("retailListingId");

-- CreateIndex
CREATE INDEX "EvidenceSource_sourceType_idx" ON "EvidenceSource"("sourceType");

-- CreateIndex
CREATE INDEX "EvidenceSource_authoritative_idx" ON "EvidenceSource"("authoritative");

-- CreateIndex
CREATE INDEX "BrandEvidence_brandId_idx" ON "BrandEvidence"("brandId");

-- CreateIndex
CREATE INDEX "BrandEvidence_evidenceSourceId_idx" ON "BrandEvidence"("evidenceSourceId");

-- CreateIndex
CREATE INDEX "ManufacturerEvidence_manufacturerId_idx" ON "ManufacturerEvidence"("manufacturerId");

-- CreateIndex
CREATE INDEX "ManufacturerEvidence_evidenceSourceId_idx" ON "ManufacturerEvidence"("evidenceSourceId");

-- CreateIndex
CREATE INDEX "SupplementEvidence_supplementId_idx" ON "SupplementEvidence"("supplementId");

-- CreateIndex
CREATE INDEX "SupplementEvidence_evidenceSourceId_idx" ON "SupplementEvidence"("evidenceSourceId");

-- CreateIndex
CREATE INDEX "ProductEvidence_productId_idx" ON "ProductEvidence"("productId");

-- CreateIndex
CREATE INDEX "ProductEvidence_evidenceSourceId_idx" ON "ProductEvidence"("evidenceSourceId");

-- CreateIndex
CREATE INDEX "RegulatoryEvent_manufacturerId_idx" ON "RegulatoryEvent"("manufacturerId");

-- CreateIndex
CREATE INDEX "RegulatoryEvent_eventType_idx" ON "RegulatoryEvent"("eventType");

-- CreateIndex
CREATE INDEX "BrandScoreSnapshot_brandId_idx" ON "BrandScoreSnapshot"("brandId");

-- CreateIndex
CREATE INDEX "BrandScoreSnapshot_brandId_mode_idx" ON "BrandScoreSnapshot"("brandId", "mode");

-- CreateIndex
CREATE INDEX "BrandScoreSnapshot_mode_overallScore_idx" ON "BrandScoreSnapshot"("mode", "overallScore");

-- CreateIndex
CREATE INDEX "ProductScoreSnapshot_productId_idx" ON "ProductScoreSnapshot"("productId");

-- CreateIndex
CREATE INDEX "ProductScoreSnapshot_productId_mode_idx" ON "ProductScoreSnapshot"("productId", "mode");

-- CreateIndex
CREATE INDEX "ProductScoreSnapshot_mode_overallScore_idx" ON "ProductScoreSnapshot"("mode", "overallScore");

-- CreateIndex
CREATE INDEX "ListingScoreSnapshot_retailListingId_idx" ON "ListingScoreSnapshot"("retailListingId");

-- CreateIndex
CREATE INDEX "ListingScoreSnapshot_retailListingId_calculatedAt_idx" ON "ListingScoreSnapshot"("retailListingId", "calculatedAt");

-- CreateIndex
CREATE INDEX "DiscoveryRun_status_idx" ON "DiscoveryRun"("status");

-- CreateIndex
CREATE INDEX "DiscoveryRun_sourceProvider_idx" ON "DiscoveryRun"("sourceProvider");

-- CreateIndex
CREATE INDEX "DiscoveryRun_startedAt_idx" ON "DiscoveryRun"("startedAt");

-- CreateIndex
CREATE INDEX "DiscoveryCandidate_discoveryRunId_idx" ON "DiscoveryCandidate"("discoveryRunId");

-- CreateIndex
CREATE INDEX "DiscoveryCandidate_candidateType_idx" ON "DiscoveryCandidate"("candidateType");

-- CreateIndex
CREATE INDEX "DiscoveryCandidate_status_idx" ON "DiscoveryCandidate"("status");

-- CreateIndex
CREATE INDEX "DiscoveryCandidate_matchedEntityType_matchedEntityId_idx" ON "DiscoveryCandidate"("matchedEntityType", "matchedEntityId");

-- CreateIndex
CREATE INDEX "KnowledgeRefreshJob_status_priority_idx" ON "KnowledgeRefreshJob"("status", "priority");

-- CreateIndex
CREATE INDEX "KnowledgeRefreshJob_jobType_idx" ON "KnowledgeRefreshJob"("jobType");

-- CreateIndex
CREATE INDEX "KnowledgeRefreshJob_entityType_entityId_idx" ON "KnowledgeRefreshJob"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "KnowledgeRefreshJob_scheduledFor_idx" ON "KnowledgeRefreshJob"("scheduledFor");

-- CreateIndex
CREATE INDEX "Brand_manufacturerId_idx" ON "Brand"("manufacturerId");

-- CreateIndex
CREATE INDEX "Brand_canonicalName_idx" ON "Brand"("canonicalName");

-- CreateIndex
CREATE INDEX "Supplement_canonicalName_idx" ON "Supplement"("canonicalName");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIngredient" ADD CONSTRAINT "ProductIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIngredient" ADD CONSTRAINT "ProductIngredient_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailerAlias" ADD CONSTRAINT "RetailerAlias_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailListing" ADD CONSTRAINT "RetailListing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailListing" ADD CONSTRAINT "RetailListing_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_retailListingId_fkey" FOREIGN KEY ("retailListingId") REFERENCES "RetailListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSnapshot" ADD CONSTRAINT "ReviewSnapshot_retailListingId_fkey" FOREIGN KEY ("retailListingId") REFERENCES "RetailListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewInsight" ADD CONSTRAINT "ReviewInsight_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewInsight" ADD CONSTRAINT "ReviewInsight_retailListingId_fkey" FOREIGN KEY ("retailListingId") REFERENCES "RetailListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCertification" ADD CONSTRAINT "ProductCertification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandEvidence" ADD CONSTRAINT "BrandEvidence_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandEvidence" ADD CONSTRAINT "BrandEvidence_evidenceSourceId_fkey" FOREIGN KEY ("evidenceSourceId") REFERENCES "EvidenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturerEvidence" ADD CONSTRAINT "ManufacturerEvidence_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturerEvidence" ADD CONSTRAINT "ManufacturerEvidence_evidenceSourceId_fkey" FOREIGN KEY ("evidenceSourceId") REFERENCES "EvidenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementEvidence" ADD CONSTRAINT "SupplementEvidence_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementEvidence" ADD CONSTRAINT "SupplementEvidence_evidenceSourceId_fkey" FOREIGN KEY ("evidenceSourceId") REFERENCES "EvidenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEvidence" ADD CONSTRAINT "ProductEvidence_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEvidence" ADD CONSTRAINT "ProductEvidence_evidenceSourceId_fkey" FOREIGN KEY ("evidenceSourceId") REFERENCES "EvidenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatoryEvent" ADD CONSTRAINT "RegulatoryEvent_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandScoreSnapshot" ADD CONSTRAINT "BrandScoreSnapshot_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductScoreSnapshot" ADD CONSTRAINT "ProductScoreSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingScoreSnapshot" ADD CONSTRAINT "ListingScoreSnapshot_retailListingId_fkey" FOREIGN KEY ("retailListingId") REFERENCES "RetailListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryCandidate" ADD CONSTRAINT "DiscoveryCandidate_discoveryRunId_fkey" FOREIGN KEY ("discoveryRunId") REFERENCES "DiscoveryRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
