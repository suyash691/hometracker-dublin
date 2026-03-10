-- CreateTable
CREATE TABLE "PreferredAmenity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "osmTag" TEXT NOT NULL,
    "googleType" TEXT,
    "icon" TEXT NOT NULL DEFAULT '📍',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "NearbyAmenity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceMetres" INTEGER NOT NULL,
    "walkingMinutes" INTEGER NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "address" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NearbyAmenity_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NearbyAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "PreferredAmenity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommuteEstimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "workplaceLabel" TEXT NOT NULL,
    "workplaceAddress" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "distanceMetres" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommuteEstimate_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
