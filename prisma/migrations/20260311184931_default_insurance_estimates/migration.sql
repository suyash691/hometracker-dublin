-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TotalCostEstimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "deposit" REAL NOT NULL,
    "stampDuty" REAL NOT NULL,
    "legalFees" REAL NOT NULL DEFAULT 2500,
    "landRegistryFees" REAL NOT NULL DEFAULT 700,
    "surveyFee" REAL NOT NULL DEFAULT 500,
    "valuationFee" REAL NOT NULL DEFAULT 185,
    "mortgageProtection" REAL NOT NULL DEFAULT 500,
    "homeInsurance" REAL NOT NULL DEFAULT 500,
    "movingCosts" REAL NOT NULL DEFAULT 800,
    "otherCosts" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "TotalCostEstimate_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TotalCostEstimate" ("deposit", "homeInsurance", "houseId", "id", "landRegistryFees", "legalFees", "mortgageProtection", "movingCosts", "otherCosts", "purchasePrice", "stampDuty", "surveyFee", "valuationFee") SELECT "deposit", "homeInsurance", "houseId", "id", "landRegistryFees", "legalFees", "mortgageProtection", "movingCosts", "otherCosts", "purchasePrice", "stampDuty", "surveyFee", "valuationFee" FROM "TotalCostEstimate";
DROP TABLE "TotalCostEstimate";
ALTER TABLE "new_TotalCostEstimate" RENAME TO "TotalCostEstimate";
CREATE UNIQUE INDEX "TotalCostEstimate_houseId_key" ON "TotalCostEstimate"("houseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
