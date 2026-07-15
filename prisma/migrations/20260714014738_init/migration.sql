-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "aliases" TEXT[],
    "website" TEXT,
    "practitionerGrade" BOOLEAN,
    "thirdPartyTested" BOOLEAN,
    "cgmpCertified" BOOLEAN,
    "uspVerified" BOOLEAN,
    "nsfCertified" BOOLEAN,
    "veganOptions" BOOLEAN,
    "hypoallergenic" BOOLEAN,
    "priceTier" TEXT,
    "availability" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_canonicalName_key" ON "Brand"("canonicalName");
