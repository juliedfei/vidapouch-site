/*
  Warnings:

  - A unique constraint covering the columns `[shoppingProductId]` on the table `ProductResearchCache` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductResearchCache" ADD COLUMN     "shoppingProductId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductResearchCache_shoppingProductId_key" ON "ProductResearchCache"("shoppingProductId");
