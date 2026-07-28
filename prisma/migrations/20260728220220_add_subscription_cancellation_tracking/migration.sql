-- AlterTable
ALTER TABLE "VidaPouchOrder" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancellationScheduledAt" TIMESTAMP(3),
ADD COLUMN     "scheduledCancellationAt" TIMESTAMP(3);
