# Module 31: Neighbourhood Intelligence — Commute, Amenities & Walkability

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: User request + Reseller audit gap #8

## Problem

Dublin buyers consistently cite "walkability" and commute as top decision factors. The app has `workplaceAddress` in BuyerProfile but doesn't use it. Buyers have no way to compare neighbourhoods across houses on practical daily-life metrics: how far is the nearest Tesco? Can I walk to a gym? How long is the commute?

## Overview

Per-house neighbourhood analysis showing:
- Commute time/distance from house to workplace(s)
- Nearest supermarkets (Tesco, Lidl, Aldi, Dunnes, SuperValu, Centra)
- Nearest configurable activities (gym, park, pharmacy, school, LUAS/DART, playground, pool, etc.)
- All with walking distance (metres) and walking time (minutes)
- Side-by-side comparison across shortlisted houses

## Geo Provider — Dual Support

The app supports two geo providers, configurable via environment variable:

| Provider | Env Var | Cost | Notes |
|----------|---------|------|-------|
| **OpenStreetMap + Overpass API** (default) | `GEO_PROVIDER=osm` | Free | No API key. Uses Nominatim for geocoding, Overpass for amenity search, OSRM for routing. Rate-limited (1 req/sec for Nominatim). Self-hostable. |
| **Google Maps Platform** | `GEO_PROVIDER=google` + `GOOGLE_MAPS_API_KEY=...` | Paid (free tier: $200/mo credit) | Uses Geocoding API, Places API (Nearby Search), Directions API (walking). More accurate, faster, better coverage of business names. |

The app auto-falls back to OSM if Google key is not set.

## Entities

### PreferredAmenity (user-configurable)

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| name | string | display name, e.g. "Gym" |
| osmTag | string | Overpass tag, e.g. "leisure=fitness_centre" |
| googleType | string | Google Places type, e.g. "gym" |
| icon | string | emoji, e.g. "🏋️" |
| enabled | boolean | user toggles on/off |

### Default Amenities (pre-seeded)

| Name | Icon | OSM Tag | Google Type |
|------|------|---------|-------------|
| Tesco | 🛒 | name=Tesco | — (text search) |
| Lidl | 🛒 | name=Lidl | — (text search) |
| Aldi | 🛒 | name=Aldi | — (text search) |
| Dunnes Stores | 🛒 | name=Dunnes | — (text search) |
| SuperValu | 🛒 | name=SuperValu | — (text search) |
| Any Supermarket | 🏪 | shop=supermarket | supermarket |
| Pharmacy | 💊 | amenity=pharmacy | pharmacy |
| GP / Doctor | 🏥 | amenity=doctors | doctor |
| Park | 🌳 | leisure=park | park |
| Playground | 🛝 | leisure=playground | — (text search) |
| Gym | 🏋️ | leisure=fitness_centre | gym |
| Swimming Pool | 🏊 | leisure=swimming_pool | — (text search) |
| Pilates / Yoga | 🧘 | leisure=fitness_centre (filtered) | — (text search) |
| Primary School | 🏫 | amenity=school | primary_school |
| Secondary School | 🎓 | amenity=school | secondary_school |
| DART Station | 🚆 | railway=station + operator=Iarnród Éireann | train_station |
| LUAS Stop | 🚊 | railway=tram_stop | transit_station |
| Bus Stop | 🚌 | highway=bus_stop | bus_station |
| Café | ☕ | amenity=cafe | cafe |
| Restaurant | 🍽️ | amenity=restaurant | restaurant |

Users can enable/disable any of these and add custom ones.

### NearbyAmenity (cached per house)

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| amenityId | fk | links to PreferredAmenity |
| name | string | actual place name, e.g. "Tesco Express Drumcondra" |
| distanceMetres | int | straight-line or walking distance |
| walkingMinutes | int | estimated at 5km/h or from routing API |
| lat | float | |
| lng | float | |
| address | string? | |
| lastUpdated | datetime | |

### CommuteEstimate (cached per house)

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| workplaceLabel | string | e.g. "Sarah's office" |
| workplaceAddress | string | |
| mode | enum | walking, cycling, driving, transit |
| distanceMetres | int | |
| durationMinutes | int | |
| lastUpdated | datetime | |

## Automation Level

| Aspect | Auto/Manual |
|--------|-------------|
| Geocoding house address | **Auto** — on house create/import |
| Amenity search | **Auto** — triggered on house create, refreshable |
| Commute calculation | **Auto** — from house to profile.workplaceAddress |
| Walking distance/time | **Auto** — OSRM routing or Google Directions |
| Amenity preferences | **Manual** — user enables/disables in profile |
| Custom amenities | **Manual** — user adds name + type |
| Workplace address | **Manual** — set once in BuyerProfile (already exists) |

## API

```
# Amenity preferences (user config)
GET    /api/amenity-preferences                    # list all with enabled status
PUT    /api/amenity-preferences/:id                # toggle enabled, edit
POST   /api/amenity-preferences                    # add custom amenity
POST   /api/seed-amenities                         # seed defaults

# Per-house neighbourhood data
GET    /api/houses/:id/neighbourhood               # all cached amenities + commute
POST   /api/houses/:id/neighbourhood/refresh       # trigger fresh lookup

# Commute
```

## UI

### Profile Page Addition

New section "Neighbourhood Preferences":
- Workplace address (already exists)
- Second workplace address (optional — for partner)
- Amenity checklist with toggles (pre-seeded defaults)
- "Add custom amenity" button

### House Detail — New "Neighbourhood" Tab

```
┌──────────────────────────────────────────────────────────────┐
│ Neighbourhood — 42 Phibsborough Road                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 🚶 Commute                                                   │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Sarah's office (Dublin 2)     18 min walk │ 6 min cycle │  │
│ │ John's office (Sandyford)     42 min transit │ 35 min 🚗│  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ 🛒 Supermarkets                                              │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Tesco Express Phibsborough    350m │ 4 min walk         │  │
│ │ Lidl Phibsborough             600m │ 8 min walk         │  │
│ │ Dunnes Stores Phibsborough    800m │ 10 min walk        │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ 🏋️ Activities                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 🌳 Blessington Street Basin   200m │ 3 min walk         │  │
│ │ 🏋️ FLYEfit Phibsborough      450m │ 6 min walk         │  │
│ │ 💊 Hickey's Pharmacy          300m │ 4 min walk         │  │
│ │ 🚊 LUAS Broadstone            500m │ 7 min walk         │  │
│ │ 🏫 St Peter's NS              350m │ 5 min walk         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ [🔄 Refresh]                    Last updated: 10 Mar 2026    │
└──────────────────────────────────────────────────────────────┘
```

### House Comparison (future)

Side-by-side neighbourhood comparison across 2-3 shortlisted houses:

| Amenity | 42 Phibsborough | 8 Drumcondra | 15 Glasnevin |
|---------|----------------|--------------|--------------|
| Commute (Sarah) | 18 min walk | 22 min walk | 28 min walk |
| Nearest Tesco | 4 min | 6 min | 12 min |
| Nearest Park | 3 min | 5 min | 2 min |
| LUAS/DART | 7 min | 15 min | 20 min |

## Environment Variables

```env
# Geo provider: "osm" (default, free) or "google" (needs API key)
GEO_PROVIDER="osm"

# Google Maps (optional — only if GEO_PROVIDER=google)
# Enable: Geocoding API, Places API, Directions API in Google Cloud Console
# GOOGLE_MAPS_API_KEY="AIza..."

# OSM rate limiting (default 1 req/sec for public Nominatim)
# For heavy use, self-host Nominatim + Overpass
# NOMINATIM_URL="https://nominatim.openstreetmap.org"
# OVERPASS_URL="https://overpass-api.de/api/interpreter"
# OSRM_URL="https://router.project-osrm.org"
```

## Implementation Notes

### OSM Provider Flow

```
House address → Nominatim geocode → (lat, lng)
  → Overpass API: query amenities within 2km radius
  → OSRM: walking route from house to each amenity
  → Cache results in NearbyAmenity table
```

### Google Provider Flow

```
House address → Geocoding API → (lat, lng)
  → Places API (Nearby Search): query by type within 2km
  → Directions API: walking route from house to each result
  → Cache results in NearbyAmenity table
```

### Geocoding Abstraction

```typescript
// lib/geo.ts
interface GeoProvider {
  geocode(address: string): Promise<{ lat: number; lng: number }>;
  nearbySearch(lat: number, lng: number, type: string, radius: number): Promise<Place[]>;
  walkingRoute(from: LatLng, to: LatLng): Promise<{ distanceMetres: number; durationMinutes: number }>;
}
```

Both providers implement this interface. The app picks based on `GEO_PROVIDER` env var.

---

# Module 32: Multi-Modal Commute Routing

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Extends: Module 31 (Neighbourhood)

## Problem

The current neighbourhood module only calculates walking routes, and the OSM fallback uses a crude `haversine × 1.3` factor. Dublin commuters use a mix of walking, cycling, driving, bus, LUAS, and DART. A house that's 45 minutes by bus might be 15 minutes by LUAS — this difference is a major factor in purchase decisions.

## Transport Modes

| Mode | Icon | OSM Provider | Google Provider |
|------|------|-------------|-----------------|
| Walking | 🚶 | OSRM `/foot/` | Directions API `mode=walking` |
| Cycling | 🚲 | OSRM `/bicycle/` | Directions API `mode=bicycling` |
| Driving | 🚗 | OSRM `/car/` | Directions API `mode=driving` |
| Transit | 🚌 | Not natively supported — see below | Directions API `mode=transit` |

### Transit Routing (Dublin-specific)

OSRM doesn't support public transit. For the OSM provider, transit is handled differently:

**Option A: TFI Journey Planner scraping** — Transport for Ireland (transportforireland.ie) has a journey planner. Scrape the result for a given origin/destination.

**Option B: OpenTripPlanner** — Open-source transit router that uses GTFS data. NTA publishes Dublin GTFS feeds. Can be self-hosted but heavy.

**Option C: Estimate from nearest stop** — Find nearest LUAS/DART/bus stop (already in amenity data), estimate walk-to-stop + average transit time + walk-from-stop. Less accurate but no external dependency.

**Recommended: Option C for OSM provider (simple, no external dependency), Google Directions API `mode=transit` for Google provider (accurate, includes real timetables).**

## Routing Accuracy (replacing haversine fallback)

| Scenario | Current | Proposed |
|----------|---------|----------|
| OSRM available | Accurate walking route | Accurate route for all 3 OSRM profiles (foot/bicycle/car) |
| OSRM unavailable | `haversine × 1.3` (crude) | `haversine × mode_factor` with better factors |
| Google available | N/A | Accurate for all 4 modes including transit |

### Improved Haversine Fallback Factors

When OSRM is unreachable, use research-based multipliers:

| Mode | Factor | Speed | Source |
|------|--------|-------|--------|
| Walking | × 1.3 | 5 km/h | Manhattan distance approximation |
| Cycling | × 1.25 | 15 km/h | Slightly more direct than walking |
| Driving | × 1.4 | 30 km/h (urban Dublin) | More detours, one-way systems |
| Transit | × 1.6 | 20 km/h average | Includes walk-to-stop, waiting, transfers |

## Updated Entity: CommuteEstimate

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| workplaceLabel | string | "Sarah's workplace" |
| workplaceAddress | string | |
| mode | enum | walking, cycling, driving, transit |
| distanceMetres | int | |
| durationMinutes | int | |
| routeSummary | string? | e.g. "via LUAS Green Line" or "via N11" |
| lastUpdated | datetime | |

Each workplace now gets **4 rows** (one per mode) instead of 1.

## Updated GeoProvider Interface

```typescript
interface GeoProvider {
  geocode(address: string): Promise<LatLng>;
  nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]>;
  route(from: LatLng, to: LatLng, mode: "walking" | "cycling" | "driving" | "transit"): Promise<Route>;
}

interface Route {
  distanceMetres: number;
  durationMinutes: number;
  summary?: string;  // e.g. "via LUAS Green Line"
}
```

### OSM Provider Implementation

```
route(from, to, "walking")  → OSRM /route/v1/foot/{coords}
route(from, to, "cycling")  → OSRM /route/v1/bicycle/{coords}
route(from, to, "driving")  → OSRM /route/v1/car/{coords}
route(from, to, "transit")  → estimate: find nearest transit stop, walk + avg transit speed + walk
```

### Google Provider Implementation

```
route(from, to, mode)  → Directions API with mode param (all 4 supported natively)
```

## UI: Neighbourhood Tab (updated)

```
🚶 Commute — Sarah's workplace (Dublin 2)
┌──────────┬──────────┬──────────┬──────────┐
│ 🚶 Walk  │ 🚲 Cycle │ 🚗 Drive │ 🚌 Transit│
│ 35 min   │ 12 min   │ 18 min   │ 22 min   │
│ 2.8 km   │ 3.1 km   │ 4.2 km   │ via LUAS │
└──────────┴──────────┴──────────┴──────────┘

🚶 Commute — John's workplace (Sandyford)
┌──────────┬──────────┬──────────┬──────────┐
│ 🚶 Walk  │ 🚲 Cycle │ 🚗 Drive │ 🚌 Transit│
│ 85 min   │ 28 min   │ 25 min   │ 35 min   │
│ 7.1 km   │ 7.8 km   │ 9.2 km   │ via LUAS │
└──────────┴──────────┴──────────┴──────────┘
```

## API Changes

No new endpoints. The existing `POST /api/houses/:id/neighbourhood` refresh now creates 4 CommuteEstimate rows per workplace (one per mode) instead of 1.

`GET /api/houses/:id/neighbourhood` returns all commute estimates grouped by workplace.

## Environment Variables (no changes)

Same as Module 31. OSRM profiles (foot/bicycle/car) are all available on the public OSRM server. Google Directions API supports all 4 modes with the same API key.

---

# Module 33: Amenity Walkability Threshold

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Extends: Module 31 (Neighbourhood)

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
