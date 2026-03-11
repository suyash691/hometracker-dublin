/*
  Warnings:

  - You are about to drop the column `daysOnMarket` on the `House` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerSqm` on the `House` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_House" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "eircode" TEXT,
    "neighbourhood" TEXT,
    "askingPrice" REAL,
    "currentBid" REAL,
    "listingUrl" TEXT,
    "offrUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'wishlist',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "propertyType" TEXT,
    "ber" TEXT,
    "isNewBuild" BOOLEAN NOT NULL DEFAULT false,
    "squareMetres" REAL,
    "lat" REAL,
    "lng" REAL,
    "berEpi" TEXT,
    "publishDate" DATETIME,
    "agentName" TEXT,
    "agentBranch" TEXT,
    "agentPhone" TEXT,
    "notes" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "viewingDate" DATETIME,
    "addedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_House" ("addedBy", "address", "agentBranch", "agentName", "agentPhone", "askingPrice", "bathrooms", "bedrooms", "ber", "berEpi", "cons", "createdAt", "currentBid", "eircode", "id", "isNewBuild", "lat", "listingUrl", "lng", "neighbourhood", "notes", "offrUrl", "propertyType", "pros", "publishDate", "squareMetres", "status", "updatedAt", "viewingDate") SELECT "addedBy", "address", "agentBranch", "agentName", "agentPhone", "askingPrice", "bathrooms", "bedrooms", "ber", "berEpi", "cons", "createdAt", "currentBid", "eircode", "id", "isNewBuild", "lat", "listingUrl", "lng", "neighbourhood", "notes", "offrUrl", "propertyType", "pros", "publishDate", "squareMetres", "status", "updatedAt", "viewingDate" FROM "House";
DROP TABLE "House";
ALTER TABLE "new_House" RENAME TO "House";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
