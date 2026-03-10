export type { LatLng, Place, Route, GeoProvider, TransportMode } from "./types";
import type { GeoProvider } from "./types";
import { OsmProvider } from "./osm";
import { GoogleMapsProvider } from "./google";

export function getGeoProvider(): GeoProvider {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (process.env.GEO_PROVIDER === "google" && key) return new GoogleMapsProvider(key);
  return new OsmProvider();
}
