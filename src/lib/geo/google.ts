import type { GeoProvider, LatLng, Place, Route } from "./types";

export class GoogleMapsProvider implements GeoProvider {
  constructor(private apiKey: string) {}
  private base = "https://maps.googleapis.com/maps/api";

  async geocode(address: string): Promise<LatLng> {
    const res = await fetch(`${this.base}/geocode/json?address=${encodeURIComponent(address + ", Dublin, Ireland")}&key=${this.apiKey}`);
    const data = await res.json();
    if (!data.results?.[0]) throw new Error(`Geocode failed for: ${address}`);
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  }

  async nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]> {
    // query is either a Google type ("gym") or a name ("Tesco")
    const isType = !query.includes("=");
    const params = isType
      ? `location=${center.lat},${center.lng}&radius=${radiusMetres}&type=${query}&key=${this.apiKey}`
      : `location=${center.lat},${center.lng}&radius=${radiusMetres}&keyword=${query.split("=")[1]}&key=${this.apiKey}`;
    const res = await fetch(`${this.base}/place/nearbysearch/json?${params}`);
    const data = await res.json();
    return (data.results || []).slice(0, 5).map((r: Record<string, unknown>) => ({
      name: r.name as string,
      lat: (r.geometry as Record<string, Record<string, number>>).location.lat,
      lng: (r.geometry as Record<string, Record<string, number>>).location.lng,
      address: r.vicinity as string | undefined,
    }));
  }

  async walkingRoute(from: LatLng, to: LatLng): Promise<Route> {
    const res = await fetch(`${this.base}/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=walking&key=${this.apiKey}`);
    const data = await res.json();
    const leg = data.routes?.[0]?.legs?.[0];
    if (!leg) return { distanceMetres: 0, durationMinutes: 0 };
    return { distanceMetres: leg.distance.value, durationMinutes: Math.round(leg.duration.value / 60) };
  }
}
