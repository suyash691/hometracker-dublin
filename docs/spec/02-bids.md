# Module 02: Bids & Offr.io

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entity: BidHistory

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| amount | number | EUR |
| bidDate | datetime | |
| source | enum | manual, offr_sync |
| isOurs | boolean | our bid vs competing |
| notes | string? | e.g. "agent said 3 other bidders" |

## API

```
GET    /api/houses/:id/bids         # list bids
POST   /api/houses/:id/bids         # manual entry, auto-updates house.currentBid
POST   /api/houses/:id/bids/sync    # trigger Offr.io scrape
POST   /api/cron/offr-sync          # cron: sync all active houses with offrUrl
```

## Offr.io Sync

Scrapes current bid amount, bid count, last bid date. Cron runs every 30min (9am-6pm weekdays). Creates BidHistory record if amount changed. Updates house.currentBid.
