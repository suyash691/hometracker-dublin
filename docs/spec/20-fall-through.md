# Module 20: Fall-Through Recovery

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Reseller + Buyer)

## Problem

18% fall-through rate in Dublin (Q2 2025). When a sale collapses, buyers lose months and must restart. No way to track multiple prospects in parallel.

## Features

### One-Click "Back to Market"
When user sets status → `dropped` on a sale_agreed house:
- Preserve all data (notes, photos, bids, survey findings, costs)
- Record fall-through reason (enum: financing, title_issue, survey_findings, seller_withdrew, gazumped, chain_broke, other) + free text
- Auto-create action item: "Review what went wrong"
- Move house to `dropped` status but keep it visible in a "Previous" section

### Parallel Pipeline
- Allow multiple houses in `bidding` or `sale_agreed` simultaneously
- Dashboard shows pipeline: "3 houses in bidding, 1 sale agreed"
- Warn if mortgage AIP is being stretched across multiple timelines

### Re-Alert on Return to Market
- Cron job: for all `dropped` houses with a listingUrl, periodically check if the listing is back on Daft.ie
- If found: create activity log entry + action item "Property back on market!"

## Automation Level

All automated except: user selects fall-through reason and writes notes.

## Entity: FallThroughRecord

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| reason | enum | financing, title_issue, survey_findings, seller_withdrew, gazumped, chain_broke, other |
| notes | text? | |
| costsIncurred | number? | solicitor fees, survey fees lost |
| occurredAt | datetime | |
