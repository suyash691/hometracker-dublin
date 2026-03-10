-- CreateTable
CREATE TABLE "House" (
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
    "squareMetres" REAL,
    "notes" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "viewingDate" DATETIME,
    "addedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "caption" TEXT,
    "takenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BidHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "bidDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "isOurs" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    CONSTRAINT "BidHistory_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "category" TEXT NOT NULL DEFAULT 'other',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionItem_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MortgageTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lender" TEXT NOT NULL,
    "approvalAmount" REAL,
    "approvalExpiry" DATETIME,
    "interestRate" REAL,
    "fixedPeriod" INTEGER,
    "term" INTEGER,
    "monthlyRepayment" REAL,
    "status" TEXT NOT NULL DEFAULT 'researching',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MortgageDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mortgageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "filePath" TEXT,
    "perPerson" BOOLEAN NOT NULL DEFAULT false,
    "person" TEXT,
    CONSTRAINT "MortgageDocument_mortgageId_fkey" FOREIGN KEY ("mortgageId") REFERENCES "MortgageTracker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RenovationEstimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "estimatedCostLow" REAL,
    "estimatedCostHigh" REAL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RenovationEstimate_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ViewingChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "houseId" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ViewingChecklist_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
