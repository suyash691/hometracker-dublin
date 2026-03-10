-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name1" TEXT NOT NULL,
    "name2" TEXT NOT NULL,
    "isFirstTimeBuyer" BOOLEAN NOT NULL DEFAULT true,
    "grossIncome1" REAL NOT NULL DEFAULT 0,
    "grossIncome2" REAL NOT NULL DEFAULT 0,
    "existingMonthlyDebt" REAL NOT NULL DEFAULT 0,
    "totalSavings" REAL NOT NULL DEFAULT 0,
    "taxPaid4Years1" REAL NOT NULL DEFAULT 0,
    "taxPaid4Years2" REAL NOT NULL DEFAULT 0,
    "workplaceAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SchemeTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheme" TEXT NOT NULL,
    "eligible" BOOLEAN NOT NULL DEFAULT false,
    "estimatedAmount" REAL,
    "applicationStatus" TEXT NOT NULL DEFAULT 'not_started',
    "referenceId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TotalCostEstimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "deposit" REAL NOT NULL,
    "stampDuty" REAL NOT NULL,
    "legalFees" REAL NOT NULL DEFAULT 2500,
    "landRegistryFees" REAL NOT NULL DEFAULT 700,
    "surveyFee" REAL NOT NULL DEFAULT 500,
    "valuationFee" REAL NOT NULL DEFAULT 185,
    "mortgageProtection" REAL NOT NULL DEFAULT 0,
    "homeInsurance" REAL NOT NULL DEFAULT 0,
    "movingCosts" REAL NOT NULL DEFAULT 800,
    "otherCosts" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "TotalCostEstimate_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConveyancingTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "solicitorName" TEXT,
    "solicitorFirm" TEXT,
    "solicitorPhone" TEXT,
    "solicitorEmail" TEXT,
    "estimatedClosingDate" DATETIME,
    "actualClosingDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConveyancingTracker_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConveyancingMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conveyancingId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedDate" DATETIME,
    "notes" TEXT,
    "blockerReason" TEXT,
    CONSTRAINT "ConveyancingMilestone_conveyancingId_fkey" FOREIGN KEY ("conveyancingId") REFERENCES "ConveyancingTracker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApartmentDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "managementCompany" TEXT,
    "annualServiceCharge" REAL,
    "sinkingFundBalance" REAL,
    "sinkingFundAdequacy" TEXT,
    "fireSafetyCompliant" BOOLEAN NOT NULL DEFAULT false,
    "fireSafetyCertDate" DATETIME,
    "parkingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "parkingDetails" TEXT,
    "storageIncluded" BOOLEAN NOT NULL DEFAULT false,
    "commonAreaCondition" TEXT,
    "numberOfUnits" INTEGER,
    "yearBuilt" INTEGER,
    "defectsHistory" TEXT,
    "omcChecklist" TEXT,
    CONSTRAINT "ApartmentDetails_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DefectiveBlocksAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "buildYear" INTEGER,
    "inRiskPeriod" BOOLEAN NOT NULL DEFAULT false,
    "pyriteTestResult" TEXT NOT NULL DEFAULT 'not_tested',
    "is398Certificate" BOOLEAN NOT NULL DEFAULT false,
    "micaRisk" BOOLEAN NOT NULL DEFAULT false,
    "remediationEligible" BOOLEAN NOT NULL DEFAULT false,
    "structuralEngineerReport" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "DefectiveBlocksAssessment_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MortgageExemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mortgageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "standardLimit" REAL NOT NULL,
    "requestedAmount" REAL NOT NULL,
    "excessAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_needed',
    "lenderResponse" TEXT,
    CONSTRAINT "MortgageExemption_mortgageId_fkey" FOREIGN KEY ("mortgageId") REFERENCES "MortgageTracker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PPRComparable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "comparables" TEXT NOT NULL,
    "medianPricePerSqm" REAL,
    "askingVsSoldDelta" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PPRComparable_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SchemeTracker_scheme_key" ON "SchemeTracker"("scheme");

-- CreateIndex
CREATE UNIQUE INDEX "TotalCostEstimate_houseId_key" ON "TotalCostEstimate"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "ConveyancingTracker_houseId_key" ON "ConveyancingTracker"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentDetails_houseId_key" ON "ApartmentDetails"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "DefectiveBlocksAssessment_houseId_key" ON "DefectiveBlocksAssessment"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "PPRComparable_houseId_key" ON "PPRComparable"("houseId");
