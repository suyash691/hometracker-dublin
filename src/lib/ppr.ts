// Property Price Register lookup — uses the publicly available PPR CSV
// https://www.propertypriceregister.ie/website/npsra/pprweb.nsf/PPRDownloads?OpenForm

import { prisma } from "./db";

interface PPREntry { address: string; price: number; date: string; }

export async function refreshComparables(houseId: string) {
  const house = await prisma.house.findUnique({ where: { id: houseId } });
  if (!house) throw new Error("House not found");

  // Build search terms from address components
  const searchTerms = house.address.toLowerCase().split(/[,\s]+/).filter(w => w.length > 3);
  const neighbourhood = house.neighbourhood?.toLowerCase();

  // Fetch PPR CSV (Dublin-filtered) — cached locally
  const entries = await fetchPPRData();

  // Find comparables: same neighbourhood or street name match
  const comparables = entries
    .filter(e => {
      const addr = e.address.toLowerCase();
      if (neighbourhood && addr.includes(neighbourhood)) return true;
      return searchTerms.some(t => addr.includes(t));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const prices = comparables.map(c => c.price).filter(p => p > 0);
  const medianPrice = prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : null;
  const medianPricePerSqm = medianPrice && house.squareMetres ? Math.round(medianPrice / house.squareMetres) : null;
  const avgSold = prices.length > 0 ? prices.reduce((s, p) => s + p, 0) / prices.length : null;
  const askingVsSoldDelta = avgSold && house.askingPrice ? Math.round(((house.askingPrice - avgSold) / avgSold) * 100) : null;

  const record = await prisma.pPRComparable.upsert({
    where: { houseId },
    update: { comparables: JSON.stringify(comparables), medianPricePerSqm, askingVsSoldDelta, lastUpdated: new Date() },
    create: { houseId, comparables: JSON.stringify(comparables), medianPricePerSqm, askingVsSoldDelta },
  });
  return record;
}

async function fetchPPRData(): Promise<PPREntry[]> {
  // In production, download CSV from PPR and cache in /data/ppr/
  // For now, return empty — the refresh endpoint will populate over time
  const fs = await import("fs");
  const path = await import("path");
  const cacheFile = path.join(process.cwd(), "data", "ppr", "dublin.json");

  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  }

  // Attempt to fetch from PPR website
  try {
    const res = await fetch("https://www.propertypriceregister.ie/website/npsra/pprweb.nsf/PPR-By-County?OpenForm&County=Dublin");
    if (!res.ok) return [];
    // PPR returns HTML — would need proper CSV download parsing
    // For now return empty; users can manually populate /data/ppr/dublin.json
    return [];
  } catch {
    return [];
  }
}
