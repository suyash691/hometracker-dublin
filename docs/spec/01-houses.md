# Module 01: Houses & Listings

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entity: House

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| address | string | |
| eircode | string? | Dublin eircode |
| neighbourhood | string? | auto-detected from address |
| askingPrice | number? | EUR |
| currentBid | number? | synced from Offr.io or manual |
| listingUrl | string? | daft.ie, myhome.ie |
| offrUrl | string? | offr.io link |
| status | enum | wishlist, viewing_scheduled, viewed, bidding, sale_agreed, conveyancing, closing, closed, dropped |
| bedrooms/bathrooms | int? | |
| propertyType | enum | house, apartment, duplex, bungalow, terraced, semi_detached, detached |
| ber | string? | A1–G |
| isNewBuild | boolean | default false |
| squareMetres | number? | |
| notes | text? | free-form |
| pros/cons | text? | JSON arrays stored as strings |
| viewingDate | datetime? | |
| addedBy | string? | which partner |

## API

```
GET    /api/houses                  # list, filter by status/neighbourhood
POST   /api/houses                  # create
GET    /api/houses/:id              # detail with all relations
PUT    /api/houses/:id              # update (auto-triggers conveyancing on sale_agreed)
DELETE /api/houses/:id
POST   /api/houses/import           # paste Daft.ie URL → scrape + create
```

## Daft.ie Import

Scrapes: address, eircode, price, BER, beds, baths, type, sqm, images. Auto-detects neighbourhood from 50+ Dublin areas. Downloads up to 20 images. Auto-creates DefectiveBlocks stub and ApartmentDetails stub (if apartment/duplex).

## Sale-Agreed Trigger

When status → `sale_agreed`, auto-creates:
- ConveyancingTracker with 18 milestones
- TotalCostEstimate with stamp duty
- 4 action items (solicitor, survey, mortgage, insurance)

## Daft.ie API Fields (from gateway.daft.ie)

The import scraper uses Daft's internal API which returns rich data:

| Field | Source | Stored As | Used By |
|-------|--------|-----------|---------|
| `point.coordinates` | API | House.lat, House.lng | Neighbourhood (skips geocoding) |
| `ber.epi` | API | House.berEpi | BER cost impact display |
| `pricePerSqM` | API | Computed at read time | House detail stats, PPR comparison |
| `publishDate` | API | House.publishDate (daysOnMarket computed) | Days on market indicator |
| `seller.name/branch/phone` | API | House.agentName/agentBranch/agentPhone | Agent info display, CommLog pre-fill |
| `media.images[].floorPlan` | API | Media.type = "floorplan" | Separate floorplans from photos |
