-- CreateTable
CREATE TABLE "VidaPouchProfitSettings" (
    "id" TEXT NOT NULL,
    "pouchCost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "singleBoxCost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "dualBoxCost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "insertCost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "labelCost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "laborHourlyRate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "laborMinutesPerOrder" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherPackagingCost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VidaPouchProfitSettings_pkey" PRIMARY KEY ("id")
);
