# Design 02: Database Schema

> Parent: [DESIGN.md](../../DESIGN.md)

## All Models (31)

House, Media, BidHistory, ActionItem, MortgageTracker, MortgageDocument, RenovationEstimate, ViewingChecklist, ChecklistTemplate, ActivityLog, BuyerProfile, SchemeTracker, TotalCostEstimate, ConveyancingTracker, ConveyancingMilestone, ApartmentDetails, DefectiveBlocksAssessment, MortgageExemption, PPRComparable

## New Models (from persona audit modules 17-30)

```prisma
model BiddingStrategy {
  id                  String @id @default(uuid())
  houseId             String @unique
  hardCeiling         Float
  coolingOffMinutes   Int    @default(30)
  warningThresholdPct Float  @default(90)
  pprMedianAtBidTime  Float?
  house               House  @relation(fields: [houseId], references: [id], onDelete: Cascade)
}

model CommLog {
  id             String    @id @default(uuid())
  houseId        String?
  professional   String    // solicitor, broker, agent, surveyor, insurer, other
  contactName    String
  direction      String    // outbound, inbound
  method         String    // call, email, text, meeting
  summary        String
  responseNeeded Boolean   @default(false)
  respondedAt    DateTime?
  createdAt      DateTime  @default(now())
  house          House?    @relation(fields: [houseId], references: [id], onDelete: SetNull)
}

model SurveyFinding {
  id               String  @id @default(uuid())
  houseId          String
  category         String  // cosmetic, functional, structural, deal_breaker
  location         String
  description      String
  estimatedCostLow Float?
  estimatedCostHigh Float?
  photoPath        String?
  action           String  @default("accept") // accept, renegotiate, walk_away, monitor
  house            House   @relation(fields: [houseId], references: [id], onDelete: Cascade)
}

model FallThroughRecord {
  id            String   @id @default(uuid())
  houseId       String
  reason        String   // financing, title_issue, survey_findings, seller_withdrew, gazumped, chain_broke, other
  notes         String?
  costsIncurred Float?
  occurredAt    DateTime @default(now())
  house         House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
}

model ContractReadiness {
  id                  String  @id @default(uuid())
  idVerified          Boolean @default(false)
  amlDocsSubmitted    Boolean @default(false)
  surveyorOnStandby   Boolean @default(false)
  brokerEngaged       Boolean @default(false)
  updatedAt           DateTime @updatedAt
}

model SnagItem {
  id          String @id @default(uuid())
  houseId     String
  room        String
  category    String // cosmetic, functional, structural
  description String
  photoPath   String?
  status      String @default("identified") // identified, reported_to_builder, fixed, accepted
  priority    String @default("medium")     // low, medium, high
  house       House  @relation(fields: [houseId], references: [id], onDelete: Cascade)
}

model SellerIntel {
  id                  String  @id @default(uuid())
  houseId             String  @unique
  inChain             Boolean?
  chainLength         Int?
  isProbate           Boolean?
  solicitorAppointed  Boolean?
  motivationLevel     String? // high, medium, low, unknown
  timelineExpectation String?
  reasonForSelling    String?
  notes               String?
  house               House   @relation(fields: [houseId], references: [id], onDelete: Cascade)
}

model NewBuildCompliance {
  id                      String    @id @default(uuid())
  houseId                 String    @unique
  warrantyProvider        String?   // homebond, blp, global_home, premier, none
  warrantyRegistrationNo  String?
  warrantyExpiry          DateTime?
  bcarCommencementNotice  Boolean   @default(false)
  assignedCertifier       String?
  certOfCompliance        Boolean   @default(false)
  certOfComplianceDate    DateTime?
  house                   House     @relation(fields: [houseId], references: [id], onDelete: Cascade)
}

model JournalEntry {
  id        String   @id @default(uuid())
  houseId   String?
  type      String   // viewing_reaction, bid_reflection, milestone, freeform
  gutRating Int?     // 1-5
  content   String
  createdAt DateTime @default(now())
  house     House?   @relation(fields: [houseId], references: [id], onDelete: SetNull)
}
```

## New House Relations

```prisma
// Add to House model:
  biddingStrategy     BiddingStrategy?
  commLogs            CommLog[]
  surveyFindings      SurveyFinding[]
  fallThroughs        FallThroughRecord[]
  snagItems           SnagItem[]
  sellerIntel         SellerIntel?
  newBuildCompliance  NewBuildCompliance?
  journalEntries      JournalEntry[]
```

## Neighbourhood Models (Module 31)

```prisma
model PreferredAmenity {
  id               String  @id @default(uuid())
  name             String
  osmTag           String
  googleType       String?
  icon             String  @default("📍")
  enabled          Boolean @default(true)
  isCustom         Boolean @default(false)
  maxWalkingMetres Int     @default(1500)
  nearby           NearbyAmenity[]
}

model NearbyAmenity {
  id             String   @id @default(uuid())
  houseId        String
  amenityId      String
  name           String
  distanceMetres Int
  walkingMinutes Int
  lat            Float
  lng            Float
  address        String?
  lastUpdated    DateTime @default(now())
  house          House    @relation(...)
  amenity        PreferredAmenity @relation(...)
}

model CommuteEstimate {
  id               String   @id @default(uuid())
  houseId          String
  workplaceLabel   String
  workplaceAddress String
  mode             String   // walking, cycling, driving, transit
  distanceMetres   Int
  durationMinutes  Int
  routeSummary     String?
  lastUpdated      DateTime @default(now())
  house            House    @relation(...)
}
```

Note: BuyerProfile has `workplaceAddress1` and `workplaceAddress2` (per-partner).
