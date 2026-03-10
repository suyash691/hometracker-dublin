// Shared types for geo providers
export interface LatLng { lat: number; lng: number; }
export interface Place { name: string; lat: number; lng: number; address?: string; }
export interface Route { distanceMetres: number; durationMinutes: number; }

export interface GeoProvider {
  geocode(address: string): Promise<LatLng>;
  nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]>;
  walkingRoute(from: LatLng, to: LatLng): Promise<Route>;
}
