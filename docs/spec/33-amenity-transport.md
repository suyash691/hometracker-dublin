# Module 33: Amenity Transport Modes (Lightweight)

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Extends: Module 31 (Neighbourhood)

## Rationale

Most amenities (supermarket, pharmacy, café) are within 2km — walking time is the only metric that matters. Nobody takes a bus to Lidl 800m away.

However, some amenities are "destination" amenities where you'd travel further:
- **Gym / pool / pilates** — people will cycle or drive 2-5km
- **School** — school run is typically by car or cycle
- **DART/LUAS station** — you walk to these, but knowing the cycling time is useful for stations 1-2km away

## Design Decision

**Don't add multi-modal routing to all amenities.** Instead:

### Tier 1: Walking only (default for most amenities)
Supermarket, pharmacy, GP, park, playground, café, restaurant, bus stop

These are "walkability" indicators. If you can't walk there, the house loses points. Driving time is irrelevant — you'd drive to any of these in under 5 minutes.

### Tier 2: Walking + cycling (for destination amenities)
Gym, swimming pool, pilates/yoga, primary school, secondary school, DART station, LUAS stop

These are amenities where 1-3km is acceptable if you can cycle. Show both walking and cycling time.

## Entity Change

Add `cyclingMinutes` to NearbyAmenity (nullable — only populated for Tier 2):

| Field | Type | Notes |
|-------|------|-------|
| cyclingMinutes | int? | only for destination amenities |
| cyclingMetres | int? | cycling route distance |

## PreferredAmenity Change

Add a `tier` field:

| Field | Type | Notes |
|-------|------|-------|
| tier | int | 1 = walking only, 2 = walking + cycling |

### Default Tier Assignments

| Amenity | Tier |
|---------|------|
| Tesco, Lidl, Aldi, Dunnes, SuperValu | 1 |
| Any Supermarket | 1 |
| Pharmacy | 1 |
| GP / Doctor | 1 |
| Park | 1 |
| Playground | 1 |
| Café | 1 |
| Restaurant | 1 |
| Bus Stop | 1 |
| **Gym** | **2** |
| **Swimming Pool** | **2** |
| **Pilates / Yoga** | **2** |
| **Primary School** | **2** |
| **Secondary School** | **2** |
| **DART Station** | **2** |
| **LUAS Stop** | **2** |

## UI Change

Tier 1 amenities (unchanged):
```
🛒 Tesco Express Phibsborough    350m · 4 min walk
```

Tier 2 amenities (walking + cycling):
```
🏋️ FLYEfit Phibsborough          1.2km · 15 min walk · 5 min cycle
🚆 DART Drumcondra                1.8km · 22 min walk · 7 min cycle
```

## Implementation

During neighbourhood refresh, for Tier 2 amenities, make one additional `route(from, to, "cycling")` call after the walking route. Adds ~7 extra API calls per house refresh (7 Tier 2 amenities × 1 cycling call each).
