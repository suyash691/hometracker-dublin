"use client";
import { useEffect, useState } from "react";

interface Amenity { id: string; name: string; distanceMetres: number; walkingMinutes: number; walkable: boolean; status: string; amenity: { icon: string; name: string; maxWalkingMetres: number }; }
interface Commute { id: string; workplaceLabel: string; mode: string; distanceMetres: number; durationMinutes: number; routeSummary?: string; }
interface Transit { hasWalkableTransit: boolean; warning?: string; }
const MODE_ICONS: Record<string, string> = { walking: "🚶", cycling: "🚲", driving: "🚗", transit: "🚌" };

export default function NeighbourhoodTab({ houseId }: { houseId: string }) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [commute, setCommute] = useState<Commute[]>([]);
  const [transit, setTransit] = useState<Transit | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch(`/api/houses/${houseId}/neighbourhood`).then(r => r.json()).then(d => {
      setAmenities(d.amenities || []);
      setCommute(d.commute || []);
      setTransit(d.transit || null);
    });
  };
  useEffect(() => { load(); }, [houseId]);

  const refresh = async () => {
    setLoading(true);
    try { await fetch(`/api/houses/${houseId}/neighbourhood`, { method: "POST" }); load(); }
    catch { alert("Refresh failed"); }
    finally { setLoading(false); }
  };

  // Group commute by workplace
  const workplaces: Record<string, Commute[]> = {};
  commute.forEach(c => { (workplaces[c.workplaceLabel] ||= []).push(c); });

  // Group amenities by category
  const groups: Record<string, Amenity[]> = {};
  amenities.forEach(a => { const k = a.amenity.name; (groups[k] ||= []).push(a); });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Neighbourhood</h3>
        <button onClick={refresh} disabled={loading} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">{loading ? "Searching..." : "🔄 Refresh"}</button>
      </div>

      {/* Transit Warning */}
      {transit && !transit.hasWalkableTransit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          ⚠ No walkable public transit — {transit.warning || "no bus, LUAS, or DART within walking distance"}. This house may require driving for daily commute.
        </div>
      )}

      {/* Commute — multi-modal per workplace */}
      {Object.entries(workplaces).length > 0 && Object.entries(workplaces).map(([label, modes]) => (
        <div key={label} className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-semibold mb-2">🚶 Commute — {label}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["walking", "cycling", "driving", "transit"].map(mode => {
              const m = modes.find(c => c.mode === mode);
              if (!m) return <div key={mode} className="bg-gray-50 rounded p-2 text-center text-xs text-gray-400">{MODE_ICONS[mode]} —</div>;
              return (
                <div key={mode} className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-lg">{MODE_ICONS[mode]}</div>
                  <div className="font-semibold text-sm">{m.durationMinutes} min</div>
                  <div className="text-xs text-gray-500">{(m.distanceMetres / 1000).toFixed(1)} km</div>
                  {m.routeSummary && <div className="text-xs text-gray-400">{m.routeSummary}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Amenities with walkability indicators */}
      {Object.entries(groups).length > 0 ? Object.entries(groups).map(([name, items]) => (
        <div key={name} className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-semibold mb-2">{items[0].amenity.icon} {name}</h4>
          {items.map(a => (
            <div key={a.id} className="flex justify-between text-sm py-1">
              <span>{a.name}</span>
              <span className="text-gray-500">
                {a.distanceMetres}m · {a.walkingMinutes} min
                {a.walkable ? <span className="text-emerald-600 ml-1">✓</span> : <span className="text-orange-500 ml-1">⚠ not walkable</span>}
              </span>
            </div>
          ))}
        </div>
      )) : (
        <p className="text-gray-500 text-sm">No neighbourhood data yet. Click Refresh to search nearby amenities.</p>
      )}
    </div>
  );
}
