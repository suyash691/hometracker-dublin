# Module 33: Amenity Walkability Threshold

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Extends: Module 31 (Neighbourhood)

## Concept

An amenity that isn't walkable effectively doesn't exist for daily life. Instead of showing multi-modal transport options, simply flag amenities as "walkable" or "not walkable" based on a threshold.

## Thresholds

| Category | Max Walking Distance | Max Walking Time | Rationale |
|----------|---------------------|------------------|-----------|
| Daily essentials (supermarket, pharmacy, café) | 1,000m | 12 min | You'd go daily or multiple times a week |
| Regular use (GP, park, restaurant) | 1,500m | 18 min | Weekly visits, acceptable walk |
| Daily commute infra (bus stop, LUAS, DART) | 1,000m | 12 min | Used twice daily — must be walkable |
| Destination (gym, school, pool) | 2,000m | 25 min | Less frequent, willing to walk further |

## Display Logic

- **Within threshold**: Show normally with distance + time: `🛒 Tesco 350m · 4 min`
- **Beyond threshold**: Show with warning: `🛒 Tesco 2.1km · ⚠ not walkable`
- **Not found within 2km**: Show as missing: `🛒 Tesco — ✗ none nearby`

## PreferredAmenity Change

Add `maxWalkingMetres` field:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| maxWalkingMetres | int | 1500 | walkability threshold |

### Defaults

| Amenity | maxWalkingMetres |
|---------|-----------------|
| Tesco, Lidl, Aldi, Dunnes, SuperValu, Any Supermarket | 1000 |
| Pharmacy, Café | 1000 |
| **Bus Stop, LUAS Stop, DART Station** | **1000** |
| GP, Park, Playground, Restaurant | 1500 |
| Gym, Pool, Pilates, Primary School, Secondary School | 2000 |

Users can adjust thresholds per amenity in preferences.

## Neighbourhood Tab UI

```
🛒 Supermarkets
  Tesco Express Phibsborough       350m · 4 min ✓
  Lidl Phibsborough                600m · 8 min ✓
  Aldi                             — ✗ none nearby

🏋️ Activities
  Blessington St Basin (park)      200m · 3 min ✓
  FLYEfit (gym)                    1.8km · 22 min ⚠ not walkable
  LUAS Broadstone                  500m · 7 min ✓

💊 Services
  Hickey's Pharmacy                300m · 4 min ✓
  Dr Murphy (GP)                   1.2km · 15 min ✓
```

The ✓/⚠/✗ indicators give an instant "walkability score" for the neighbourhood without cluttering with driving/cycling times that don't matter at this distance.

## Transit Accessibility Warning

If **none** of the three transit types (bus, LUAS, DART) are within their walkable threshold (1,000m), the house gets a prominent warning on the dashboard and house detail:

```
⚠ No walkable public transit — nearest bus stop is 1.4km, nearest LUAS is 2.8km
  This house may require driving for daily commute.
```

This is surfaced:
- On the **house detail page** as a red banner above the stat cards
- On the **house list** as a 🚫🚌 icon on the card
- On the **dashboard kanban** cards for houses in bidding/sale_agreed

This is critical for Dublin where many buyers rely on public transit and a house without walkable transit access is a fundamentally different proposition.
