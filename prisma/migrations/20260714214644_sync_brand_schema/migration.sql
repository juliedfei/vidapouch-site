/*
  Warnings:

  - You are about to drop the column `aliases` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `nsfCertified` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `uspVerified` on the `Brand` table. All the data in the column will be lost.
  - The `priceTier` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `availability` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DataConfidence" AS ENUM ('VERIFIED', 'REPORTED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PriceTier" AS ENUM ('BUDGET', 'VALUE', 'MIDRANGE', 'PREMIUM', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "AvailabilityLevel" AS ENUM ('LIMITED', 'MODERATE', 'WIDE', 'NATIONAL');

-- CreateEnum
CREATE TYPE "CertificationScope" AS ENUM ('BRAND_WIDE', 'PRODUCT_SPECIFIC', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ProductForm" AS ENUM ('CAPSULE', 'TABLET', 'SOFTGEL', 'CAPLET', 'OTHER');

-- CreateEnum
CREATE TYPE "RecommendationMode" AS ENUM ('BEST_OVERALL', 'LOWEST_COST', 'PREMIUM_QUALITY', 'CLEAN_INGREDIENTS');

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "aliases",
DROP COLUMN "nsfCertified",
DROP COLUMN "uspVerified",
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "profileConfidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
DROP COLUMN "priceTier",
ADD COLUMN     "priceTier" "PriceTier",
DROP COLUMN "availability",
ADD COLUMN     "availability" "AvailabilityLevel";

-- CreateTable
CREATE TABLE "BrandAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplement" (
    "id" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "website" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailProduct" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "dosage" TEXT,
    "form" "ProductForm",
    "bottlePrice" DECIMAL(10,2) NOT NULL,
    "capsulesPerBottle" INTEGER NOT NULL,
    "servingSize" INTEGER NOT NULL DEFAULT 1,
    "estimatedShipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "url" TEXT,
    "sourceProvider" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailPriceSnapshot" (
    "id" TEXT NOT NULL,
    "retailProductId" TEXT NOT NULL,
    "bottlePrice" DECIMAL(10,2) NOT NULL,
    "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "inStock" BOOLEAN,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetailPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandCertification" (
    "brandId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "scope" "CertificationScope" NOT NULL DEFAULT 'UNKNOWN',
    "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "appliesToAllProducts" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandCertification_pkey" PRIMARY KEY ("brandId","certificationId")
);

-- CreateTable
CREATE TABLE "ProductCertification" (
    "retailProductId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "confidence" "DataConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCertification_pkey" PRIMARY KEY ("retailProductId","certificationId")
);

-- CreateTable
CREATE TABLE "BrandScore" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "mode" "RecommendationMode" NOT NULL,
    "qualityScore" INTEGER NOT NULL,
    "testingScore" INTEGER NOT NULL,
    "evidenceScore" INTEGER NOT NULL,
    "reputationScore" INTEGER NOT NULL,
    "availabilityScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationWeightSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "RecommendationMode" NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "qualityWeight" INTEGER NOT NULL,
    "testingWeight" INTEGER NOT NULL,
    "evidenceWeight" INTEGER NOT NULL,
    "reputationWeight" INTEGER NOT NULL,
    "availabilityWeight" INTEGER NOT NULL,
    "valueWeight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationWeightSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandAlias_normalizedAlias_key" ON "BrandAlias"("normalizedAlias");

-- CreateIndex
CREATE INDEX "BrandAlias_brandId_idx" ON "BrandAlias"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplement_canonicalName_key" ON "Supplement"("canonicalName");

-- CreateIndex
CREATE UNIQUE INDEX "SupplementAlias_normalizedAlias_key" ON "SupplementAlias"("normalizedAlias");

-- CreateIndex
CREATE INDEX "SupplementAlias_supplementId_idx" ON "SupplementAlias"("supplementId");

-- CreateIndex
CREATE UNIQUE INDEX "Retailer_canonicalName_key" ON "Retailer"("canonicalName");

-- CreateIndex
CREATE INDEX "RetailProduct_brandId_idx" ON "RetailProduct"("brandId");

-- CreateIndex
CREATE INDEX "RetailProduct_supplementId_idx" ON "RetailProduct"("supplementId");

-- CreateIndex
CREATE INDEX "RetailProduct_retailerId_idx" ON "RetailProduct"("retailerId");

-- CreateIndex
CREATE INDEX "RetailProduct_brandId_supplementId_idx" ON "RetailProduct"("brandId", "supplementId");

-- CreateIndex
CREATE INDEX "RetailProduct_supplementId_isActive_idx" ON "RetailProduct"("supplementId", "isActive");

-- CreateIndex
CREATE INDEX "RetailProduct_externalId_idx" ON "RetailProduct"("externalId");

-- CreateIndex
CREATE INDEX "RetailPriceSnapshot_retailProductId_idx" ON "RetailPriceSnapshot"("retailProductId");

-- CreateIndex
CREATE INDEX "RetailPriceSnapshot_capturedAt_idx" ON "RetailPriceSnapshot"("capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_name_issuer_key" ON "Certification"("name", "issuer");

-- CreateIndex
CREATE INDEX "BrandCertification_certificationId_idx" ON "BrandCertification"("certificationId");

-- CreateIndex
CREATE INDEX "ProductCertification_certificationId_idx" ON "ProductCertification"("certificationId");

-- CreateIndex
CREATE INDEX "BrandScore_brandId_idx" ON "BrandScore"("brandId");

-- CreateIndex
CREATE INDEX "BrandScore_brandId_mode_idx" ON "BrandScore"("brandId", "mode");

-- CreateIndex
CREATE INDEX "BrandScore_mode_overallScore_idx" ON "BrandScore"("mode", "overallScore");

-- CreateIndex
CREATE INDEX "RecommendationWeightSet_mode_active_idx" ON "RecommendationWeightSet"("mode", "active");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationWeightSet_mode_methodologyVersion_key" ON "RecommendationWeightSet"("mode", "methodologyVersion");

-- AddForeignKey
ALTER TABLE "BrandAlias" ADD CONSTRAINT "BrandAlias_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementAlias" ADD CONSTRAINT "SupplementAlias_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailProduct" ADD CONSTRAINT "RetailProduct_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailProduct" ADD CONSTRAINT "RetailProduct_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailProduct" ADD CONSTRAINT "RetailProduct_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailPriceSnapshot" ADD CONSTRAINT "RetailPriceSnapshot_retailProductId_fkey" FOREIGN KEY ("retailProductId") REFERENCES "RetailProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandCertification" ADD CONSTRAINT "BrandCertification_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandCertification" ADD CONSTRAINT "BrandCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCertification" ADD CONSTRAINT "ProductCertification_retailProductId_fkey" FOREIGN KEY ("retailProductId") REFERENCES "RetailProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCertification" ADD CONSTRAINT "ProductCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandScore" ADD CONSTRAINT "BrandScore_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
