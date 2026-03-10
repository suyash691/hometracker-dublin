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
