-- AlterTable
ALTER TABLE "VidaPouchFulfillmentRun" ADD COLUMN     "boxCostOverride" DECIMAL(10,4),
ADD COLUMN     "insertCostOverride" DECIMAL(10,4),
ADD COLUMN     "labelCostOverride" DECIMAL(10,4),
ADD COLUMN     "laborHourlyRateOverride" DECIMAL(10,2),
ADD COLUMN     "laborMinutesPerOrderOverride" DECIMAL(10,2),
ADD COLUMN     "otherPackagingCostOverride" DECIMAL(10,4),
ADD COLUMN     "pouchCostOverride" DECIMAL(10,4);
