import type { GeoProvider, LatLng, Place, Route } from "./types";

const UA = "HomeTracker/1.0 (Dublin house buying app)";

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
    // osmTag can be "shop=supermarket" or "name=Tesco" or "leisure=park"
    const [key, val] = osmTag.split("=");
    const isName = key === "name";
    const filter = isName ? `["name"~"${val}",i]` : `["${key}"="${val}"]`;
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

  async walkingRoute(from: LatLng, to: LatLng): Promise<Route> {
    try {
      const res = await fetch(`${this.osrm}/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`);
      const data = await res.json();
      if (data.routes?.[0]) return { distanceMetres: Math.round(data.routes[0].distance), durationMinutes: Math.round(data.routes[0].duration / 60) };
    } catch { /* fallback below */ }
    return this.haversineWalk(from, to);
  }

  private haversineWalk(a: LatLng, b: LatLng): Route {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const straight = 2 * R * Math.asin(Math.sqrt(h));
    const walking = Math.round(straight * 1.3); // walking factor
    return { distanceMetres: walking, durationMinutes: Math.round(walking / 83) }; // 5km/h
  }
}
