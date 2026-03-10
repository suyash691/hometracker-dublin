-- AlterTable
ALTER TABLE "CommuteEstimate" ADD COLUMN "routeSummary" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PreferredAmenity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "osmTag" TEXT NOT NULL,
    "googleType" TEXT,
    "icon" TEXT NOT NULL DEFAULT '📍',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "maxWalkingMetres" INTEGER NOT NULL DEFAULT 1500
);
INSERT INTO "new_PreferredAmenity" ("enabled", "googleType", "icon", "id", "isCustom", "name", "osmTag") SELECT "enabled", "googleType", "icon", "id", "isCustom", "name", "osmTag" FROM "PreferredAmenity";
DROP TABLE "PreferredAmenity";
ALTER TABLE "new_PreferredAmenity" RENAME TO "PreferredAmenity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
