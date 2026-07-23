/*
  Warnings:

  - A unique constraint covering the columns `[fingerprint]` on the table `DiscoveryCandidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fingerprint` to the `DiscoveryCandidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscoveryCandidate" ADD COLUMN     "fingerprint" TEXT NOT NULL,
ADD COLUMN     "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "occurrenceCount" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryCandidate_fingerprint_key" ON "DiscoveryCandidate"("fingerprint");

-- CreateIndex
CREATE INDEX "DiscoveryCandidate_candidateType_status_idx" ON "DiscoveryCandidate"("candidateType", "status");

-- CreateIndex
CREATE INDEX "DiscoveryCandidate_lastSeenAt_idx" ON "DiscoveryCandidate"("lastSeenAt");
