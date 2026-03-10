"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type House } from "@/lib/api";
import { HOUSE_STATUSES, PROPERTY_TYPES } from "@/lib/types";

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ address: "", askingPrice: "", bedrooms: "", bathrooms: "", propertyType: "house", ber: "", neighbourhood: "", listingUrl: "", status: "wishlist" });

  const load = () => api.houses.list().then(setHouses);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.houses.create({
      address: form.address,
      askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      propertyType: form.propertyType,
      ber: form.ber || undefined,
      neighbourhood: form.neighbourhood || undefined,
      listingUrl: form.listingUrl || undefined,
      status: form.status,
    });
    setForm({ address: "", askingPrice: "", bedrooms: "", bathrooms: "", propertyType: "house", ber: "", neighbourhood: "", listingUrl: "", status: "wishlist" });
    setShowForm(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Houses</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
          + Add House
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Asking Price (€)" type="number" value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className="border rounded px-3 py-2 text-sm">
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
            <input placeholder="BER Rating" value={form.ber} onChange={(e) => setForm({ ...form, ber: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Neighbourhood" value={form.neighbourhood} onChange={(e) => setForm({ ...form, neighbourhood: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Daft.ie / MyHome.ie URL" value={form.listingUrl} onChange={(e) => setForm({ ...form, listingUrl: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded px-3 py-2 text-sm">
              {HOUSE_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button>
        </form>
      )}

      <div className="space-y-3">
        {houses.map((h) => (
          <Link key={h.id} href={`/houses/${h.id}`} className="block bg-white rounded-lg p-4 border hover:border-emerald-400">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{h.address}</div>
                <div className="text-sm text-gray-500">
                  {h.neighbourhood && `${h.neighbourhood} · `}
                  {h.bedrooms && `${h.bedrooms} bed · `}
                  {h.bathrooms && `${h.bathrooms} bath · `}
                  {h.propertyType?.replace(/_/g, " ")}
                  {h.ber && ` · BER ${h.ber}`}
                </div>
              </div>
              <div className="text-right">
                {h.askingPrice && <div className="font-semibold text-emerald-700">€{h.askingPrice.toLocaleString()}</div>}
                {h.currentBid && <div className="text-sm text-orange-600">Bid: €{h.currentBid.toLocaleString()}</div>}
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 capitalize">{h.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          </Link>
        ))}
        {houses.length === 0 && <p className="text-gray-500 text-sm">No houses yet. Add your first one!</p>}
      </div>
    </div>
  );
}
