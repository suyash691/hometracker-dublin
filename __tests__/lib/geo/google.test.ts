/**
 * @jest-environment node
 */
import { GoogleMapsProvider } from "@/lib/geo/google";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("GoogleMapsProvider", () => {
  const gm = new GoogleMapsProvider("test-key");
  beforeEach(() => mockFetch.mockReset());

  it("geocode parses lat/lng", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ results: [{ geometry: { location: { lat: 53.35, lng: -6.26 } } }] }) });
    const r = await gm.geocode("Dublin");
    expect(r).toEqual({ lat: 53.35, lng: -6.26 });
  });

  it("geocode throws on no results", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ results: [] }) });
    await expect(gm.geocode("Nowhere")).rejects.toThrow("Geocode failed");
  });

  it("nearbySearch returns max 5 places", async () => {
    const results = Array.from({ length: 10 }, (_, i) => ({ name: `Place ${i}`, geometry: { location: { lat: 53, lng: -6 } }, vicinity: "Dublin" }));
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ results }) });
    const r = await gm.nearbySearch({ lat: 53, lng: -6 }, "gym", 2000);
    expect(r).toHaveLength(5);
  });

  it("route returns distance and duration", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ routes: [{ summary: "via N11", legs: [{ distance: { value: 5000 }, duration: { value: 900 } }] }] }) });
    const r = await gm.route({ lat: 53.35, lng: -6.26 }, { lat: 53.30, lng: -6.20 }, "driving");
    expect(r.distanceMetres).toBe(5000);
    expect(r.durationMinutes).toBe(15);
  });

  it("route returns zeros on no routes", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ routes: [] }) });
    const r = await gm.route({ lat: 53, lng: -6 }, { lat: 54, lng: -7 }, "walking");
    expect(r.distanceMetres).toBe(0);
  });

  it("includes API key in all requests", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ results: [{ geometry: { location: { lat: 53, lng: -6 } } }] }) });
    await gm.geocode("Dublin");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("key=test-key"));
  });
});
