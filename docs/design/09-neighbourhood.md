# Design 09: Neighbourhood Intelligence

> ⚠️ **Note:** The GeoProvider interface in this doc has been superseded by Design 10 (multi-modal routing). The current interface uses `route(from, to, mode)` instead of `walkingRoute(from, to)`.

> Parent: [DESIGN.md](../../DESIGN.md)

## New Prisma Models

```prisma
model PreferredAmenity {
  id         String  @id @default(uuid())
  name       String
  osmTag     String
  googleType String?
  icon       String  @default("📍")
  enabled    Boolean @default(true)
  isCustom   Boolean @default(false)
  nearby     NearbyAmenity[]
}

model NearbyAmenity {
  id              String   @id @default(uuid())
  houseId         String
  amenityId       String
  name            String
  distanceMetres  Int
  walkingMinutes  Int
  lat             Float
  lng             Float
  address         String?
  lastUpdated     DateTime @default(now())
  house           House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
  amenity         PreferredAmenity @relation(fields: [amenityId], references: [id])
}

model CommuteEstimate {
  id               String @id @default(uuid())
  houseId          String
  workplaceLabel   String
  workplaceAddress String
  mode             String // walking, cycling, driving, transit
  distanceMetres   Int
  durationMinutes  Int
  lastUpdated      DateTime @default(now())
  house            House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
}
```

Add to House model:
```prisma
  nearbyAmenities   NearbyAmenity[]
  commuteEstimates  CommuteEstimate[]
```

## Geo Provider Abstraction

```typescript
// lib/geo.ts
export interface LatLng { lat: number; lng: number; }
export interface Place { name: string; lat: number; lng: number; address?: string; }
export interface Route { distanceMetres: number; durationMinutes: number; }

export interface GeoProvider {
  geocode(address: string): Promise<LatLng>;
  nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]>;
  walkingRoute(from: LatLng, to: LatLng): Promise<Route>;
}

export function getGeoProvider(): GeoProvider {
  return process.env.GEO_PROVIDER === "google" && process.env.GOOGLE_MAPS_API_KEY
    ? new GoogleMapsProvider(process.env.GOOGLE_MAPS_API_KEY)
    : new OsmProvider();
}
```

### OSM Provider

```typescript
class OsmProvider implements GeoProvider {
  private nominatimUrl = process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org";
  private overpassUrl = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";
  private osrmUrl = process.env.OSRM_URL || "https://router.project-osrm.org";

  async geocode(address: string): Promise<LatLng> {
    // GET /search?q={address}&format=json&limit=1
    // Rate limit: 1 req/sec, User-Agent required
  }

  async nearbySearch(center: LatLng, osmTag: string, radius: number): Promise<Place[]> {
    // Overpass QL: [out:json];node["shop"="supermarket"](around:{radius},{lat},{lng});out;
    // For named searches (Tesco): node["name"~"Tesco"](around:...)
  }

  async walkingRoute(from: LatLng, to: LatLng): Promise<Route> {
    // OSRM: GET /route/v1/foot/{fromLng},{fromLat};{toLng},{toLat}?overview=false
    // Fallback: Haversine distance × 1.3 (walking factor) ÷ 83 (m/min at 5km/h)
  }
}
```

### Google Maps Provider

```typescript
class GoogleMapsProvider implements GeoProvider {
  constructor(private apiKey: string) {}

  async geocode(address: string): Promise<LatLng> {
    // GET /maps/api/geocode/json?address={address}&key={key}
  }

  async nearbySearch(center: LatLng, type: string, radius: number): Promise<Place[]> {
    // GET /maps/api/place/nearbysearch/json?location={lat},{lng}&radius={r}&type={type}&key={key}
    // For named: keyword=Tesco
  }

  async walkingRoute(from: LatLng, to: LatLng): Promise<Route> {
    // GET /maps/api/directions/json?origin={lat},{lng}&destination={lat},{lng}&mode=walking&key={key}
  }
}
```

## API Endpoints

```
GET    /api/amenity-preferences              → PreferredAmenity[]
PUT    /api/amenity-preferences/:id          → toggle enabled
POST   /api/amenity-preferences              → add custom
POST   /api/seed-amenities                   → seed 20 defaults

GET    /api/houses/:id/neighbourhood         → { commute: CommuteEstimate[], amenities: NearbyAmenity[] }
POST   /api/houses/:id/neighbourhood/refresh → trigger fresh lookup, return results

GET    /api/houses/:id/commute               → CommuteEstimate[]
```

## Neighbourhood Refresh Flow

```
POST /api/houses/:id/neighbourhood/refresh
  → Geocode house address → (lat, lng)
  → For each enabled PreferredAmenity:
      → nearbySearch(houseLat, houseLng, amenity.osmTag or googleType, 2000m)
      → Take closest result
      → walkingRoute(house, result) → distance + time
      → Upsert NearbyAmenity record
  → For each workplace in BuyerProfile:
      → Geocode workplace
      → walkingRoute + cycling + transit estimates
      → Upsert CommuteEstimate records
  → Return all results
```

## UI: House Detail "Neighbourhood" Tab

New tab added after "costs", always visible.

Sections:
1. **Commute** — table with workplace(s), walking/cycling/transit/driving times
2. **Supermarkets** — nearest of each chain with distance + walking time
3. **Activities** — nearest of each enabled amenity type
4. **Refresh button** — triggers /neighbourhood/refresh

## UI: Profile Page Addition

New section below existing fields:

```
Neighbourhood Preferences
─────────────────────────
Partner 2 Workplace: [________________]  (optional)

Amenities to track:
  ☑ Tesco        ☑ Lidl         ☑ Aldi
  ☑ Supermarket  ☑ Pharmacy     ☑ GP
  ☑ Park         ☑ Gym          ☐ Pool
  ☑ LUAS/DART    ☑ Bus Stop     ☑ School
  ☐ Pilates      ☐ Playground   ☑ Café

  [+ Add custom amenity]
```

## Environment Variables

```env
# Geo provider (default: osm)
GEO_PROVIDER="osm"

# Google Maps (optional)
# GOOGLE_MAPS_API_KEY="AIza..."

# OSM endpoints (optional, defaults to public instances)
# NOMINATIM_URL="https://nominatim.openstreetmap.org"
# OVERPASS_URL="https://overpass-api.de/api/interpreter"
# OSRM_URL="https://router.project-osrm.org"
```

---

# Design 10: Multi-Modal Commute Routing

> Parent: [DESIGN.md](../../DESIGN.md) | Extends: Design 09 (Neighbourhood)

## Updated GeoProvider Interface

```typescript
// lib/geo/types.ts — updated
export interface Route {
  distanceMetres: number;
  durationMinutes: number;
  summary?: string;  // "via LUAS Green Line", "via N11"
}

export type TransportMode = "walking" | "cycling" | "driving" | "transit";

export interface GeoProvider {
  geocode(address: string): Promise<LatLng>;
  nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]>;
  route(from: LatLng, to: LatLng, mode: TransportMode): Promise<Route>;
}
```

## OSM Provider — OSRM Profiles

```typescript
// lib/geo/osm.ts — route method
async route(from: LatLng, to: LatLng, mode: TransportMode): Promise<Route> {
  const profile = { walking: "foot", cycling: "bicycle", driving: "car", transit: "foot" }[mode];

  try {
    const res = await fetch(`${this.osrmUrl}/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`);
    const data = await res.json();
    if (data.routes?.[0]) {
      const r = data.routes[0];
      // For transit: estimate as walk-to-nearest-stop + transit-speed + walk-from-stop
      if (mode === "transit") return this.estimateTransit(from, to, r.distance);
      return { distanceMetres: Math.round(r.distance), durationMinutes: Math.round(r.duration / 60) };
    }
  } catch { /* fallback */ }

  return this.fallbackEstimate(from, to, mode);
}

// Transit estimate: straight-line distance at average transit speed + overhead
private estimateTransit(from: LatLng, to: LatLng, walkingDistance: number): Route {
  const transitDistance = Math.round(walkingDistance * 1.2); // transit routes are ~1.2x walking distance
  const avgSpeedMps = 20000 / 3600; // 20 km/h average including stops
  const waitTime = 8; // average 8 min wait in Dublin
  const walkToStop = 5; // average 5 min walk to nearest stop
  return {
    distanceMetres: transitDistance,
    durationMinutes: walkToStop + waitTime + Math.round(transitDistance / avgSpeedMps / 60),
    summary: "estimated (walk + transit + walk)",
  };
}

// Improved haversine fallback with mode-specific factors
private fallbackEstimate(a: LatLng, b: LatLng, mode: TransportMode): Route {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180) * Math.cos(b.lat*Math.PI/180) * Math.sin(dLng/2)**2;
  const straight = 2 * R * Math.asin(Math.sqrt(h));

  const config = {
    walking:  { factor: 1.3, speedKmh: 5 },
    cycling:  { factor: 1.25, speedKmh: 15 },
    driving:  { factor: 1.4, speedKmh: 30 },
    transit:  { factor: 1.6, speedKmh: 20 },
  }[mode];

  const distance = Math.round(straight * config.factor);
  const minutes = Math.round(distance / (config.speedKmh * 1000 / 60));
  return { distanceMetres: distance, durationMinutes: minutes, summary: "estimated" };
}
```

## Google Provider — Native Multi-Modal

```typescript
// lib/geo/google.ts — route method
async route(from: LatLng, to: LatLng, mode: TransportMode): Promise<Route> {
  const googleMode = { walking: "walking", cycling: "bicycling", driving: "driving", transit: "transit" }[mode];
  const res = await fetch(`${this.base}/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=${googleMode}&key=${this.apiKey}`);
  const data = await res.json();
  const leg = data.routes?.[0]?.legs?.[0];
  if (!leg) return { distanceMetres: 0, durationMinutes: 0 };
  return {
    distanceMetres: leg.distance.value,
    durationMinutes: Math.round(leg.duration.value / 60),
    summary: data.routes[0].summary || leg.steps?.find(s => s.transit_details)?.transit_details?.line?.short_name,
  };
}
```

## Updated Neighbourhood Service

```typescript
// For each workplace, calculate ALL 4 modes:
const MODES: TransportMode[] = ["walking", "cycling", "driving", "transit"];

for (const wp of workplaces) {
  const workLoc = await geo.geocode(wp.address);
  for (const mode of MODES) {
    const route = await geo.route(houseLoc, workLoc, mode);
    await prisma.commuteEstimate.create({
      data: {
        houseId, workplaceLabel: `${wp.label}'s workplace`,
        workplaceAddress: wp.address, mode,
        distanceMetres: route.distanceMetres,
        durationMinutes: route.durationMinutes,
      },
    });
  }
}
```

## Updated Neighbourhood Tab UI

```
Commute — Sarah's workplace (Dublin 2)
┌──────────┬──────────┬──────────┬──────────┐
│ 🚶 35min │ 🚲 12min │ 🚗 18min │ 🚌 22min │
│   2.8km  │   3.1km  │   4.2km  │ via LUAS │
└──────────┴──────────┴──────────┴──────────┘

Commute — John's workplace (Sandyford)
┌──────────┬──────────┬──────────┬──────────┐
│ 🚶 85min │ 🚲 28min │ 🚗 25min │ 🚌 35min │
│   7.1km  │   7.8km  │   9.2km  │ via LUAS │
└──────────┴──────────┴──────────┴──────────┘
```

Each mode shown as a card with icon, duration, and distance. Transit shows route summary if available.
