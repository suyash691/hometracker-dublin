# Module 32: Multi-Modal Commute Routing

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Extends: Module 31 (Neighbourhood)

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
