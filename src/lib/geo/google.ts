import type { GeoProvider, LatLng, Place, Route, TransportMode } from "./types";

export class GoogleMapsProvider implements GeoProvider {
  constructor(private apiKey: string) {}
  private base = "https://maps.googleapis.com/maps/api";

  async geocode(address: string): Promise<LatLng> {
    const suffix = /dublin|ireland/i.test(address) ? "" : ", Dublin, Ireland";
    const res = await fetch(`${this.base}/geocode/json?address=${encodeURIComponent(address + suffix)}&key=${this.apiKey}`);
    const data = await res.json();
    if (!data.results?.[0]) throw new Error(`Geocode failed for: ${address} (status: ${data.status}, suffix: "${suffix}")`);
    return data.results[0].geometry.location;
  }

  async nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]> {
    const searchTerm = query.includes("=") ? query.split("=")[1] : query;

    // Use nearbysearch for transit (finds physically closest stop) and generic types
    // Use textsearch for named stores and specific activities (more accurate names)
    const useNearby = ["bus_station", "transit_station", "train_station", "bus stop", "LUAS stop", "DART station"].some(t => searchTerm.toLowerCase().includes(t.toLowerCase()));

    let url: string;
    if (useNearby) {
      // For transit: search by type to find physically closest stop
      const type = searchTerm.toLowerCase().includes("bus") ? "bus_station" : searchTerm.toLowerCase().includes("dart") ? "train_station" : "transit_station";
      url = `${this.base}/place/nearbysearch/json?location=${center.lat},${center.lng}&radius=${radiusMetres}&type=${type}&key=${this.apiKey}`;
    } else {
      url = `${this.base}/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&location=${center.lat},${center.lng}&radius=${radiusMetres}&key=${this.apiKey}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    return (data.results || []).slice(0, 5).map((r: Record<string, unknown>) => ({
      name: r.name as string,
      lat: (r.geometry as Record<string, Record<string, number>>).location.lat,
      lng: (r.geometry as Record<string, Record<string, number>>).location.lng,
      address: (r.formatted_address || r.vicinity) as string | undefined,
    }));
  }

  async route(from: LatLng, to: LatLng, mode: TransportMode): Promise<Route> {
    const gMode = { walking: "walking", cycling: "bicycling", driving: "driving", transit: "transit" }[mode];
    const res = await fetch(`${this.base}/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=${gMode}&key=${this.apiKey}`);
    const data = await res.json();
    const leg = data.routes?.[0]?.legs?.[0];
    if (!leg) return { distanceMetres: 0, durationMinutes: 0 };
    const summary = data.routes[0].summary || leg.steps?.find((s: Record<string, unknown>) => s.transit_details)?.transit_details?.line?.short_name;
    return { distanceMetres: leg.distance.value, durationMinutes: Math.round(leg.duration.value / 60), summary };
  }
}
