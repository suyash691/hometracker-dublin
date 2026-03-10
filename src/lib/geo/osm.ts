import type { GeoProvider, LatLng, Place, Route, TransportMode } from "./types";

const UA = "HomeTracker/1.0 (Dublin house buying app)";
const FALLBACK = { walking: { f: 1.3, s: 5 }, cycling: { f: 1.25, s: 15 }, driving: { f: 1.4, s: 30 }, transit: { f: 1.6, s: 20 } };

export class OsmProvider implements GeoProvider {
  private nominatim = process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org";
  private overpass = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";
  private osrm = process.env.OSRM_URL || "https://router.project-osrm.org";

  async geocode(address: string): Promise<LatLng> {
    const res = await fetch(`${this.nominatim}/search?q=${encodeURIComponent(address + ", Dublin, Ireland")}&format=json&limit=1`, { headers: { "User-Agent": UA } });
    const data = await res.json();
    if (!data[0]) throw new Error(`Geocode failed for: ${address}`);
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }

  async nearbySearch(center: LatLng, osmTag: string, radiusMetres: number): Promise<Place[]> {
    const [key, val] = osmTag.split("=");
    const filter = key === "name" ? `["name"~"${val}",i]` : `["${key}"="${val}"]`;
    const query = `[out:json][timeout:10];(node${filter}(around:${radiusMetres},${center.lat},${center.lng});way${filter}(around:${radiusMetres},${center.lat},${center.lng}););out center 5;`;
    const res = await fetch(this.overpass, { method: "POST", body: `data=${encodeURIComponent(query)}`, headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA } });
    const data = await res.json();
    return (data.elements || []).map((el: Record<string, unknown>) => {
      const tags = (el.tags || {}) as Record<string, string>;
      const lat = (el.lat || (el.center as Record<string, number>)?.lat) as number;
      const lng = (el.lon || (el.center as Record<string, number>)?.lon) as number;
      return { name: tags.name || val, lat, lng, address: tags["addr:street"] ? `${tags["addr:housenumber"] || ""} ${tags["addr:street"]}`.trim() : undefined };
    }).filter((p: Place) => p.lat && p.lng);
  }

  async route(from: LatLng, to: LatLng, mode: TransportMode): Promise<Route> {
    const profile = { walking: "foot", cycling: "bicycle", driving: "car", transit: "foot" }[mode];
    try {
      const res = await fetch(`${this.osrm}/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`);
      const data = await res.json();
      if (data.routes?.[0]) {
        if (mode === "transit") return this.estimateTransit(data.routes[0].distance);
        return { distanceMetres: Math.round(data.routes[0].distance), durationMinutes: Math.round(data.routes[0].duration / 60) };
      }
    } catch { /* fallback */ }
    return this.fallback(from, to, mode);
  }

  private estimateTransit(walkDist: number): Route {
    const dist = Math.round(walkDist * 1.2);
    return { distanceMetres: dist, durationMinutes: 5 + 8 + Math.round(dist / (20000 / 3600) / 60), summary: "estimated (walk + transit + walk)" };
  }

  private fallback(a: LatLng, b: LatLng, mode: TransportMode): Route {
    const R = 6371000, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const straight = 2 * R * Math.asin(Math.sqrt(h));
    const { f, s } = FALLBACK[mode];
    const dist = Math.round(straight * f);
    return { distanceMetres: dist, durationMinutes: Math.round(dist / (s * 1000 / 60)), summary: "estimated" };
  }
}
