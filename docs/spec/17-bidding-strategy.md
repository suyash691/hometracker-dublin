# Module 17: Bidding Strategy

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Source: Persona Audit (Reseller + Buyer)

## Problem

ESRI Feb 2026 research proved Dublin's open-auction bidding causes systematic overbidding. 88% of Dublin properties sell over asking. Buyers need protection from auction fever.

## Entity: BiddingStrategy

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | one per house |
| hardCeiling | number | absolute max the couple will bid |
| coolingOffMinutes | int | default 30. Timer before allowing bid above 90% of ceiling |
| warningThresholdPct | number | default 90. Warn when bid reaches this % of ceiling |
| pprMedianAtBidTime | number? | snapshot of area median when bidding started |

## Automation Level

| Aspect | Auto/Manual |
|--------|-------------|
| Hard ceiling enforcement | **Auto** — UI blocks bid entry above ceiling, requires 24hr override |
| Cooling-off timer | **Auto** — countdown before allowing bids above warning threshold |
| PPR comparison during bidding | **Auto** — shows "you're X% above area median" from PPRComparable data |
| Walk-away prompt | **Auto** — triggered when ceiling reached |
| Ghost bid logging | **Manual** — user flags suspicious bid patterns with timestamp + notes |
| Setting the ceiling amount | **Manual** — couple agrees and enters once per house |

## API

```
GET/PUT  /api/houses/:id/bidding-strategy
```

## UI Behavior

- When user opens bid form and a BiddingStrategy exists:
  - Show ceiling bar: "€X / €Y ceiling (Z%)"
  - If bid amount > warningThresholdPct: show orange warning + start cooling-off timer
  - If bid amount > hardCeiling: block submission, show "You agreed not to exceed €Y. Override requires both partners to confirm and a 24-hour wait."
  - Show PPR context: "Area median: €X/sqm. Your bid: €Y/sqm (+Z%)"
- Walk-away prompt at ceiling: "You've reached your limit. The average Dublin buyer bids on 6 properties before going sale agreed. It's okay to walk away."
