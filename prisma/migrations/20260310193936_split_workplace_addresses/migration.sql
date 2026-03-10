/*
  Warnings:

  - You are about to drop the column `workplaceAddress` on the `BuyerProfile` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BuyerProfile" (
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
    "workplaceAddress1" TEXT,
    "workplaceAddress2" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BuyerProfile" ("createdAt", "existingMonthlyDebt", "grossIncome1", "grossIncome2", "id", "isFirstTimeBuyer", "name1", "name2", "taxPaid4Years1", "taxPaid4Years2", "totalSavings", "updatedAt") SELECT "createdAt", "existingMonthlyDebt", "grossIncome1", "grossIncome2", "id", "isFirstTimeBuyer", "name1", "name2", "taxPaid4Years1", "taxPaid4Years2", "totalSavings", "updatedAt" FROM "BuyerProfile";
DROP TABLE "BuyerProfile";
ALTER TABLE "new_BuyerProfile" RENAME TO "BuyerProfile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
