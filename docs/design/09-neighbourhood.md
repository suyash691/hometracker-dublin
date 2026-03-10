# Design 09: Neighbourhood Intelligence

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
