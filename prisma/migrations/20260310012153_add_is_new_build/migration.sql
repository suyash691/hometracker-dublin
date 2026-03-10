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
    "notes" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "viewingDate" DATETIME,
    "addedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_House" ("addedBy", "address", "askingPrice", "bathrooms", "bedrooms", "ber", "cons", "createdAt", "currentBid", "eircode", "id", "listingUrl", "neighbourhood", "notes", "offrUrl", "propertyType", "pros", "squareMetres", "status", "updatedAt", "viewingDate") SELECT "addedBy", "address", "askingPrice", "bathrooms", "bedrooms", "ber", "cons", "createdAt", "currentBid", "eircode", "id", "listingUrl", "neighbourhood", "notes", "offrUrl", "propertyType", "pros", "squareMetres", "status", "updatedAt", "viewingDate" FROM "House";
DROP TABLE "House";
ALTER TABLE "new_House" RENAME TO "House";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
