/**
 * @jest-environment node
 */
import { getGeoProvider } from "@/lib/geo";
import { OsmProvider } from "@/lib/geo/osm";
import { GoogleMapsProvider } from "@/lib/geo/google";

describe("getGeoProvider", () => {
  const origEnv = process.env;
  beforeEach(() => { process.env = { ...origEnv }; });
  afterAll(() => { process.env = origEnv; });

  it("default → OsmProvider", () => {
    delete process.env.GEO_PROVIDER;
    delete process.env.GOOGLE_MAPS_API_KEY;
    expect(getGeoProvider()).toBeInstanceOf(OsmProvider);
  });
  it("GEO_PROVIDER=osm → OsmProvider", () => {
    process.env.GEO_PROVIDER = "osm";
    expect(getGeoProvider()).toBeInstanceOf(OsmProvider);
  });
  it("GEO_PROVIDER=google with key → GoogleMapsProvider", () => {
    process.env.GEO_PROVIDER = "google";
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
    expect(getGeoProvider()).toBeInstanceOf(GoogleMapsProvider);
  });
  it("GEO_PROVIDER=google without key → falls back to OsmProvider", () => {
    process.env.GEO_PROVIDER = "google";
    delete process.env.GOOGLE_MAPS_API_KEY;
    expect(getGeoProvider()).toBeInstanceOf(OsmProvider);
  });
});
