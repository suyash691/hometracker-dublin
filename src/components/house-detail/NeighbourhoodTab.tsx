"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Amenity { id: string; name: string; distanceMetres: number; walkingMinutes: number; amenity: { icon: string; name: string }; }
interface Commute { id: string; workplaceLabel: string; mode: string; distanceMetres: number; durationMinutes: number; }

export default function NeighbourhoodTab({ houseId }: { houseId: string }) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [commute, setCommute] = useState<Commute[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch(`/api/houses/${houseId}/neighbourhood`).then(r => r.json()).then(d => {
      setAmenities(d.amenities || []);
      setCommute(d.commute || []);
    });
  };
  useEffect(() => { load(); }, [houseId]);

  const refresh = async () => {
    setLoading(true);
    try { await fetch(`/api/houses/${houseId}/neighbourhood`, { method: "POST" }); load(); }
    catch { alert("Refresh failed — check geo provider config"); }
    finally { setLoading(false); }
  };

  const groups: Record<string, Amenity[]> = {};
  amenities.forEach(a => { const k = a.amenity.icon + " " + a.amenity.name; (groups[k] ||= []).push(a); });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Neighbourhood</h3>
        <button onClick={refresh} disabled={loading} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">{loading ? "Searching..." : "🔄 Refresh"}</button>
      </div>

      {commute.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-semibold mb-2">🚶 Commute</h4>
          {commute.map(c => (
            <div key={c.id} className="flex justify-between text-sm py-1">
              <span>{c.workplaceLabel}</span>
              <span className="text-gray-500">{c.durationMinutes} min {c.mode} · {(c.distanceMetres / 1000).toFixed(1)}km</span>
            </div>
          ))}
        </div>
      )}

      {Object.keys(groups).length > 0 ? Object.entries(groups).map(([label, items]) => (
        <div key={label} className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-semibold mb-2">{label}</h4>
          {items.map(a => (
            <div key={a.id} className="flex justify-between text-sm py-1">
              <span>{a.name}</span>
              <span className="text-gray-500">{a.distanceMetres}m · {a.walkingMinutes} min walk</span>
            </div>
          ))}
        </div>
      )) : (
        <p className="text-gray-500 text-sm">No neighbourhood data yet. Click Refresh to search nearby amenities.</p>
      )}
    </div>
  );
}
