import * as cheerio from "cheerio";

export interface OffrBidInfo {
  currentBid: number | null;
  bidCount: number | null;
  lastBidDate: string | null;
}

export async function scrapeOffrBids(offrUrl: string): Promise<OffrBidInfo> {
  const res = await fetch(offrUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
  });
  if (!res.ok) throw new Error(`Failed to fetch Offr page: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Offr.io typically shows current bid amount prominently
  let currentBid: number | null = null;
  let bidCount: number | null = null;
  let lastBidDate: string | null = null;

  // Try common patterns for bid amount
  const bidText =
    $('[class*="bid-amount"], [class*="current-bid"], [class*="highest"]').text() ||
    $('span:contains("€")').filter((_, el) => {
      const t = $(el).text();
      return /€[\d,]+/.test(t) && !t.includes("Guide") && !t.includes("AMV");
    }).first().text();

  const priceMatch = bidText.match(/€([\d,]+)/);
  if (priceMatch) {
    currentBid = parseInt(priceMatch[1].replace(/,/g, ""), 10);
  }

  // Try to find bid count
  const countText = $('[class*="bid-count"], [class*="number-of-bids"]').text() ||
    $('*:contains("bid")').filter((_, el) => /\d+\s*bids?/i.test($(el).text())).first().text();
  const countMatch = countText.match(/(\d+)\s*bids?/i);
  if (countMatch) bidCount = parseInt(countMatch[1], 10);

  // Try to find last bid date
  const dateText = $('[class*="bid-date"], [class*="last-bid"], time').first().text() ||
    $('[class*="bid-date"]').attr("datetime");
  if (dateText) lastBidDate = dateText.trim();

  return { currentBid, bidCount, lastBidDate };
}
