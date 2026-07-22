-- CreateEnum
CREATE TYPE "VidaPouchPricingVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "VidaPouchFulfillmentScenario" AS ENUM ('SINGLE_BOX', 'DUAL_BOX', 'CUSTOM');

-- CreateEnum
CREATE TYPE "VidaPouchSettingValueType" AS ENUM ('NUMERIC', 'TEXT', 'BOOLEAN');

-- CreateTable
CREATE TABLE "VidaPouchPricingVersion" (
    "id" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "status" "VidaPouchPricingVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchPricingVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchPlan" (
    "id" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "pricingVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "supplementLimit" INTEGER NOT NULL,
    "pooledCostAllowance" DECIMAL(10,2),
    "fulfillmentScenario" "VidaPouchFulfillmentScenario" NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "customerDescription" TEXT,
    "customerSelectionDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VidaPouchPricingSetting" (
    "id" TEXT NOT NULL,
    "pricingVersionId" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "valueType" "VidaPouchSettingValueType" NOT NULL,
    "numericValue" DECIMAL(65,30),
    "textValue" TEXT,
    "booleanValue" BOOLEAN,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchPricingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchPricingVersion_versionName_key" ON "VidaPouchPricingVersion"("versionName");

-- CreateIndex
CREATE INDEX "VidaPouchPricingVersion_status_idx" ON "VidaPouchPricingVersion"("status");

-- CreateIndex
CREATE INDEX "VidaPouchPricingVersion_effectiveFrom_idx" ON "VidaPouchPricingVersion"("effectiveFrom");

-- CreateIndex
CREATE INDEX "VidaPouchPlan_pricingVersionId_idx" ON "VidaPouchPlan"("pricingVersionId");

-- CreateIndex
CREATE INDEX "VidaPouchPlan_pricingVersionId_active_displayOrder_idx" ON "VidaPouchPlan"("pricingVersionId", "active", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchPlan_planKey_pricingVersionId_key" ON "VidaPouchPlan"("planKey", "pricingVersionId");

-- CreateIndex
CREATE INDEX "VidaPouchPricingSetting_pricingVersionId_idx" ON "VidaPouchPricingSetting"("pricingVersionId");

-- CreateIndex
CREATE INDEX "VidaPouchPricingSetting_pricingVersionId_active_idx" ON "VidaPouchPricingSetting"("pricingVersionId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "VidaPouchPricingSetting_pricingVersionId_settingKey_key" ON "VidaPouchPricingSetting"("pricingVersionId", "settingKey");

-- AddForeignKey
ALTER TABLE "VidaPouchPlan" ADD CONSTRAINT "VidaPouchPlan_pricingVersionId_fkey" FOREIGN KEY ("pricingVersionId") REFERENCES "VidaPouchPricingVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VidaPouchPricingSetting" ADD CONSTRAINT "VidaPouchPricingSetting_pricingVersionId_fkey" FOREIGN KEY ("pricingVersionId") REFERENCES "VidaPouchPricingVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
