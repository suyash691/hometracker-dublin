-- CreateTable
CREATE TABLE "BiddingStrategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "hardCeiling" REAL NOT NULL,
    "coolingOffMinutes" INTEGER NOT NULL DEFAULT 30,
    "warningThresholdPct" REAL NOT NULL DEFAULT 90,
    "pprMedianAtBidTime" REAL,
    CONSTRAINT "BiddingStrategy_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT,
    "professional" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "responseNeeded" BOOLEAN NOT NULL DEFAULT false,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommLog_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurveyFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedCostLow" REAL,
    "estimatedCostHigh" REAL,
    "photoPath" TEXT,
    "action" TEXT NOT NULL DEFAULT 'accept',
    CONSTRAINT "SurveyFinding_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FallThroughRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "costsIncurred" REAL,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FallThroughRecord_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractReadiness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "amlDocsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "surveyorOnStandby" BOOLEAN NOT NULL DEFAULT false,
    "brokerEngaged" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SnagItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'identified',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    CONSTRAINT "SnagItem_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SellerIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "inChain" BOOLEAN,
    "chainLength" INTEGER,
    "isProbate" BOOLEAN,
    "solicitorAppointed" BOOLEAN,
    "motivationLevel" TEXT,
    "timelineExpectation" TEXT,
    "reasonForSelling" TEXT,
    "notes" TEXT,
    CONSTRAINT "SellerIntel_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewBuildCompliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "warrantyProvider" TEXT,
    "warrantyRegistrationNo" TEXT,
    "warrantyExpiry" DATETIME,
    "bcarCommencementNotice" BOOLEAN NOT NULL DEFAULT false,
    "assignedCertifier" TEXT,
    "certOfCompliance" BOOLEAN NOT NULL DEFAULT false,
    "certOfComplianceDate" DATETIME,
    CONSTRAINT "NewBuildCompliance_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT,
    "type" TEXT NOT NULL,
    "gutRating" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JournalEntry_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BiddingStrategy_houseId_key" ON "BiddingStrategy"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerIntel_houseId_key" ON "SellerIntel"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "NewBuildCompliance_houseId_key" ON "NewBuildCompliance"("houseId");
