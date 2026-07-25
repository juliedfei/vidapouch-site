-- CreateTable
CREATE TABLE "MarketplaceSearchCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "sourceProvider" TEXT NOT NULL DEFAULT 'serpapi',
    "searchEngine" TEXT NOT NULL DEFAULT 'google_shopping',
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'us',
    "language" TEXT NOT NULL DEFAULT 'en',
    "pageNumber" INTEGER NOT NULL DEFAULT 1,
    "responsePayload" JSONB NOT NULL,
    "rawResultCount" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceSearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceSearchCache_cacheKey_key" ON "MarketplaceSearchCache"("cacheKey");

-- CreateIndex
CREATE INDEX "MarketplaceSearchCache_expiresAt_idx" ON "MarketplaceSearchCache"("expiresAt");

-- CreateIndex
CREATE INDEX "MarketplaceSearchCache_normalizedQuery_idx" ON "MarketplaceSearchCache"("normalizedQuery");

-- CreateIndex
CREATE INDEX "MarketplaceSearchCache_sourceProvider_searchEngine_idx" ON "MarketplaceSearchCache"("sourceProvider", "searchEngine");

-- CreateIndex
CREATE INDEX "MarketplaceSearchCache_lastAccessedAt_idx" ON "MarketplaceSearchCache"("lastAccessedAt");
