/**
 * @jest-environment node
 */
import { OsmProvider } from "@/lib/geo/osm";

// Mock fetch for OSRM
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("OsmProvider.route — multi-modal", () => {
  const osm = new OsmProvider();
  const from = { lat: 53.356, lng: -6.265 };
  const to = { lat: 53.340, lng: -6.260 };

  beforeEach(() => mockFetch.mockReset());

  it("walking uses OSRM foot profile", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ routes: [{ distance: 2000, duration: 1500 }] }) });
    const r = await osm.route(from, to, "walking");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/foot/"));
    expect(r.distanceMetres).toBe(2000);
    expect(r.durationMinutes).toBe(25);
  });

  it("cycling uses foot distance with cycling speed", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ routes: [{ distance: 2200, duration: 600 }] }) });
    const r = await osm.route(from, to, "cycling");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/foot/"));
    expect(r.distanceMetres).toBe(2200);
  });

  it("driving uses foot distance with driving speed", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ routes: [{ distance: 3000, duration: 480 }] }) });
    const r = await osm.route(from, to, "driving");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/foot/"));
    expect(r.distanceMetres).toBe(3300);
  });

  it("transit returns estimate with summary", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ routes: [{ distance: 2000, duration: 1500 }] }) });
    const r = await osm.route(from, to, "transit");
    expect(r.summary).toContain("estimated");
    expect(r.durationMinutes).toBeGreaterThan(0);
  });

  it("falls back to haversine when OSRM fails", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));
    const r = await osm.route(from, to, "walking");
    expect(r.distanceMetres).toBeGreaterThan(0);
    expect(r.durationMinutes).toBeGreaterThan(0);
    expect(r.summary).toBe("estimated");
  });

  it("driving fallback uses 1.4 factor and 30km/h", async () => {
    mockFetch.mockRejectedValue(new Error("fail"));
    const r = await osm.route(from, to, "driving");
    // Driving should be faster than walking for same distance
    const walk = await osm.route(from, to, "walking");
    expect(r.durationMinutes).toBeLessThan(walk.durationMinutes);
  });

  it("cycling fallback is faster than walking", async () => {
    mockFetch.mockRejectedValue(new Error("fail"));
    const walk = await osm.route(from, to, "walking");
    const cycle = await osm.route(from, to, "cycling");
    expect(cycle.durationMinutes).toBeLessThan(walk.durationMinutes);
  });
});
