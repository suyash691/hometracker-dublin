"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type House, type ActionItem, type ActivityLog, type BorrowingLimits, type Mortgage } from "@/lib/api";
import { HOUSE_STATUSES } from "@/lib/types";

export default function Dashboard() {
  const [houses, setHouses] = useState<House[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [limits, setLimits] = useState<BorrowingLimits | null>(null);
  const [htbEst, setHtbEst] = useState<number | null>(null);
  const [aipDays, setAipDays] = useState<number | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);

  const load = () => {
    api.houses.list().then(setHouses);
    api.actions.list().then(setActions);
    api.activity.list(20).then(setActivity);
    // Fetch profile-derived stats
    api.profile.get().then(p => {
      if (!p) return;
      api.calculator.borrowing(p.grossIncome1, p.grossIncome2, p.isFirstTimeBuyer).then(setLimits);
      setHtbEst(Math.round(Math.min(400_000 * 0.1, 30_000, p.taxPaid4Years1 + p.taxPaid4Years2)));
    }).catch(() => {});
    // Fetch nearest AIP expiry
    api.mortgage.list().then(ms => {
      const expiries = ms.filter(m => m.approvalExpiry).map(m => Math.ceil((new Date(m.approvalExpiry!).getTime() - Date.now()) / 86400000));
      if (expiries.length > 0) setAipDays(Math.min(...expiries));
    }).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const grouped = HOUSE_STATUSES.reduce((acc, s) => ({ ...acc, [s]: houses.filter(h => h.status === s) }), {} as Record<string, House[]>);
  const overdue = actions.filter(a => a.status !== "done" && a.dueDate && new Date(a.dueDate) < new Date());
  const upcoming = houses.filter(h => h.viewingDate && new Date(h.viewingDate) >= new Date()).sort((a, b) => new Date(a.viewingDate!).getTime() - new Date(b.viewingDate!).getTime()).slice(0, 5);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    setImporting(true);
    try { await api.houses.import(importUrl); setImportUrl(""); load(); } catch (err) { alert(err instanceof Error ? err.message : "Import failed"); }
    finally { setImporting(false); }
  };

  const f = (n: number) => `€${n.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <form onSubmit={handleImport} className="flex gap-2">
        <input placeholder="Paste Daft.ie or MyHome.ie URL to import..." value={importUrl} onChange={e => setImportUrl(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" />
        <button type="submit" disabled={importing} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 disabled:opacity-50">{importing ? "Importing..." : "Import Listing"}</button>
      </form>

      {/* Stats row 1: counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Houses" value={houses.length} />
        <Stat label="Bidding" value={grouped.bidding?.length || 0} />
        <Stat label="Viewings Scheduled" value={grouped.viewing_scheduled?.length || 0} />
        <Stat label="Overdue Actions" value={overdue.length} color="red" />
      </div>

      {/* Stats row 2: financial (from profile) */}
      {(limits || aipDays !== null || htbEst !== null) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {limits && <Stat label="Max Budget" value={f(limits.maxPropertyPrice)} color="blue" />}
          {aipDays !== null && <Stat label="AIP Expires" value={aipDays > 0 ? `${aipDays} days` : "EXPIRED"} color={aipDays < 30 ? "red" : "default"} />}
          {htbEst !== null && htbEst > 0 && <Stat label="HTB Estimate" value={f(htbEst)} color="blue" />}
        </div>
      )}

      {/* Upcoming Viewings */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Upcoming Viewings</h2>
        {upcoming.length === 0 ? <p className="text-gray-500 text-sm">No upcoming viewings</p> : (
          <div className="space-y-2">{upcoming.map(h => (
            <Link key={h.id} href={`/houses/${h.id}`} className="block bg-white rounded-lg p-3 border hover:border-emerald-400">
              <div className="flex justify-between"><span className="font-medium">{h.address}</span><span className="text-sm text-gray-500">{new Date(h.viewingDate!).toLocaleDateString("en-IE")}</span></div>
            </Link>
          ))}</div>
        )}
      </section>

      {/* Kanban */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Houses by Status</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {HOUSE_STATUSES.map(status => (
            <div key={status} className="min-w-[220px] bg-gray-100 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 capitalize">{status.replace(/_/g, " ")} ({grouped[status]?.length || 0})</h3>
              <div className="space-y-2">{(grouped[status] || []).map(h => (
                <Link key={h.id} href={`/houses/${h.id}`} className="block bg-white rounded p-2 text-sm border hover:border-emerald-400">
                  <div className="font-medium truncate">{h.address}</div>
                  {h.askingPrice && <div className="text-gray-500">€{h.askingPrice.toLocaleString()}</div>}
                </Link>
              ))}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {overdue.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-red-600">Overdue Actions</h2>
            <div className="space-y-2">{overdue.map(a => (
              <div key={a.id} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex justify-between"><span className="font-medium text-sm">{a.title}</span><span className="text-xs text-red-500">Due {new Date(a.dueDate!).toLocaleDateString("en-IE")}</span></div>
                {a.house && <span className="text-xs text-gray-500">{a.house.address}</span>}
              </div>
            ))}</div>
          </section>
        )}
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          {activity.length === 0 ? <p className="text-gray-500 text-sm">No activity yet</p> : (
            <div className="space-y-2">{activity.map(a => (
              <div key={a.id} className="bg-white rounded p-2 border text-sm">
                <span className="font-medium text-emerald-700">{a.user}</span>{" "}<span className="text-gray-600">{a.detail || a.action}</span>
                <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString("en-IE")}</div>
              </div>
            ))}</div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color?: string }) {
  const c = color === "red" ? "text-red-600" : color === "blue" ? "text-blue-600" : "text-emerald-700";
  return <div className="bg-white rounded-lg p-4 border"><div className="text-sm text-gray-500">{label}</div><div className={`text-2xl font-bold ${c}`}>{value}</div></div>;
}
