-- AlterTable
ALTER TABLE "VidaPouchBillingCycle" ADD COLUMN     "shipByDate" TIMESTAMP(3),
ADD COLUMN     "targetDeliveryDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VidaPouchOrder" ADD COLUMN     "nextShipByDate" TIMESTAMP(3),
ADD COLUMN     "nextTargetDeliveryDate" TIMESTAMP(3);
