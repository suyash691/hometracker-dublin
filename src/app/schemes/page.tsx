"use client";
import { useEffect, useState } from "react";
import { api, type SchemeEligibility, type House, type BorrowingLimits } from "@/lib/api";
import { SEAI_GRANTS } from "@/lib/constants/seai";

const SCHEME_META: Record<string, { icon: string; name: string; desc: string; link: string }> = {
  htb: { icon: "🏠", name: "Help to Buy (HTB)", desc: "Tax refund up to €30,000 on new builds for first-time buyers", link: "https://www.revenue.ie/en/property/help-to-buy-incentive/" },
  fhs: { icon: "🤝", name: "First Home Scheme (FHS)", desc: "State takes up to 30% equity stake in new-build home", link: "https://www.firsthomescheme.ie/" },
  lahl: { icon: "🏛️", name: "Local Authority Home Loan", desc: "Government mortgage up to €415,000 in Dublin (fixed rate)", link: "https://localauthorityhomeloan.ie/" },
};

export default function SchemesPage() {
  const [elig, setElig] = useState<SchemeEligibility | null>(null);
  const [error, setError] = useState("");
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<string>("");
  const [limits, setLimits] = useState<BorrowingLimits | null>(null);
  const [htbEst, setHtbEst] = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    api.schemes.eligibility().then(setElig).catch(() => setError("Set up your Buyer Profile first to check eligibility."));
    api.houses.list().then(setHouses);
    api.profile.get().then(p => {
      if (!p) return;
      api.calculator.borrowing(p.grossIncome1, p.grossIncome2, p.isFirstTimeBuyer).then(setLimits);
      setHtbEst(Math.round(Math.min(400_000 * 0.1, 30_000, p.taxPaid4Years1 + p.taxPaid4Years2)));
      setSavings(p.totalSavings);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Government Schemes</h1>
      {error && <p className="text-orange-600 text-sm bg-orange-50 p-3 rounded-lg">{error} <a href="/profile" className="underline">Go to Profile →</a></p>}

      {elig && (
        <div className="space-y-4">
          {(["htb", "fhs", "lahl"] as const).map(key => {
            const meta = SCHEME_META[key];
            const data = elig[key];
            return (
              <div key={key} className="bg-white rounded-lg border p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">{meta.icon} {meta.name}</h2>
                    <p className="text-sm text-gray-500">{meta.desc}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${data.eligible ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                    {data.eligible ? "✓ ELIGIBLE" : "✗ NOT ELIGIBLE"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{data.reason}</p>
                {data.eligible && (
                  <div className="text-lg font-bold text-blue-700 mb-2">
                    {"maxRefund" in data && `Up to €${(data.maxRefund as number).toLocaleString()}`}
                    {"maxEquity" in data && `Up to €${(data.maxEquity as number).toLocaleString()}`}
                    {"maxLoan" in data && `Up to €${(data.maxLoan as number).toLocaleString()}`}
                  </div>
                )}
                <a href={meta.link} target="_blank" rel="noopener" className="text-sm text-blue-600 hover:underline">Apply / Learn more →</a>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-lg border p-5">
        <h2 className="text-lg font-semibold mb-3">📊 Funding Stack per House</h2>
        <label className="block"><span className="text-sm text-gray-500 mb-1">Select a house to see funding breakdown</span>
        <select value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)} className="border rounded px-3 py-2 text-sm mb-3 w-full">
          <option value="">Select a house...</option>
          {houses.filter(h => h.askingPrice).map(h => <option key={h.id} value={h.id}>{h.address} — €{h.askingPrice!.toLocaleString()}</option>)}
        </select></label>
        {selectedHouse && limits && (() => {
          const h = houses.find(x => x.id === selectedHouse);
          if (!h?.askingPrice) return null;
          const price = h.askingPrice;
          const mortgage = Math.min(Math.round(price * 0.9), limits.maxLTI);
          const deposit = Math.round(price * 0.1);
          const gap = price - mortgage - deposit;
          const items = [
            { label: "Mortgage", amount: mortgage, color: "bg-emerald-500" },
            { label: "Deposit", amount: deposit, color: "bg-blue-500" },
            ...(htbEst > 0 ? [{ label: "HTB Refund", amount: htbEst, color: "bg-purple-500" }] : []),
          ];
          const total = items.reduce((s, i) => s + i.amount, 0);
          const surplus = total - price;
          return (
            <div>
              <div className="w-full h-6 rounded-full overflow-hidden flex mb-2">
                {items.map(i => <div key={i.label} className={`${i.color} h-full`} style={{ width: `${(i.amount / price) * 100}%` }} />)}
              </div>
              <div className="space-y-1 text-sm">
                {items.map(i => <div key={i.label} className="flex justify-between"><span>{i.label}</span><span>€{i.amount.toLocaleString()}</span></div>)}
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>{surplus >= 0 ? "Surplus" : "Shortfall"}</span>
                  <span className={surplus >= 0 ? "text-emerald-600" : "text-red-600"}>€{Math.abs(surplus).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="bg-white rounded-lg border p-5">
        <h2 className="text-lg font-semibold mb-3">🌱 SEAI Energy Upgrade Grants (post-purchase)</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-2">Upgrade</th><th className="text-right p-2">Grant</th><th className="text-left p-2">Note</th></tr></thead>
          <tbody>
            {SEAI_GRANTS.map(g => (
              <tr key={g.item} className="border-t"><td className="p-2">{g.item}</td><td className="p-2 text-right font-semibold">€{g.amount.toLocaleString()}</td><td className="p-2 text-gray-500">{g.note}</td></tr>
            ))}
            <tr className="border-t font-semibold bg-gray-50"><td className="p-2">Total potential</td><td className="p-2 text-right">€{SEAI_GRANTS.reduce((s, g) => s + g.amount, 0).toLocaleString()}</td><td className="p-2"></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
