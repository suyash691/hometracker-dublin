# Module 31: Neighbourhood Intelligence — Commute, Amenities & Walkability

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Source: User request + Reseller audit gap #8

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
GET    /api/houses/:id/commute                     # cached commute estimates
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
