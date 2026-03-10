// Geo provider factory — picks OSM (free) or Google Maps based on env
export type { LatLng, Place, Route, GeoProvider } from "./types";
import type { GeoProvider } from "./types";
import { OsmProvider } from "./osm";
import { GoogleMapsProvider } from "./google";

export function getGeoProvider(): GeoProvider {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (process.env.GEO_PROVIDER === "google" && key) return new GoogleMapsProvider(key);
  return new OsmProvider();
}
