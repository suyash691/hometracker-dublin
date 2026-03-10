export interface LatLng { lat: number; lng: number; }
export interface Place { name: string; lat: number; lng: number; address?: string; }
export interface Route { distanceMetres: number; durationMinutes: number; summary?: string; }
export type TransportMode = "walking" | "cycling" | "driving" | "transit";

export interface GeoProvider {
  geocode(address: string): Promise<LatLng>;
  nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]>;
  route(from: LatLng, to: LatLng, mode: TransportMode): Promise<Route>;
}
