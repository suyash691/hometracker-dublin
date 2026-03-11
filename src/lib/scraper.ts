// Daft.ie scraper — uses internal API to bypass Cloudflare
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

export interface ScrapedListing {
  address: string; askingPrice?: number; bedrooms?: number; bathrooms?: number;
  propertyType?: string; ber?: string; squareMetres?: number; neighbourhood?: string;
  eircode?: string; listingUrl: string; images: string[];
  // New fields from Daft API
  lat?: number; lng?: number; berEpi?: string; pricePerSqm?: number;
  publishDate?: Date; agentName?: string; agentBranch?: string; agentPhone?: string;
  floorplanImages: string[];
}

// Extract listing ID from Daft URL: /for-sale/.../6515784 → 6515784
function extractListingId(url: string): string | null {
  const match = url.match(/\/(\d{5,})$/);
  return match ? match[1] : null;
}

export async function scrapeDaftListing(url: string): Promise<ScrapedListing> {
  const listingId = extractListingId(url);

  // Try Daft's internal API first (bypasses Cloudflare)
  if (listingId) {
    try {
      console.log(`[scraper] Trying Daft API for listing ${listingId}`);
      return await fetchViaApi(listingId, url);
    } catch (err) {
      console.log(`[scraper] API failed: ${err instanceof Error ? err.message : err}, falling back to HTML scrape`);
    }
  }

  // Fallback: direct HTML fetch (may hit Cloudflare)
  return await fetchViaHtml(url);
}

async function fetchViaApi(listingId: string, originalUrl: string): Promise<ScrapedListing> {
  // Use Daft's internal search API (same as daftlistings Python library)
  // POST to gateway.daft.ie/api/v2/ads/listings with filters
  console.log(`[scraper] Trying Daft gateway API for listing ${listingId}`);

  const res = await fetch("https://gateway.daft.ie/api/v2/ads/listings", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      "brand": "daft",
      "platform": "web",
      "Origin": "https://www.daft.ie",
      "Referer": "https://www.daft.ie/",
    },
    body: JSON.stringify({
      section: "residential-for-sale",
      filters: [{ name: "id", values: [listingId] }],
      paging: { from: "0", pagesize: "1" },
    }),
  });

  if (!res.ok) throw new Error(`Daft gateway API returned ${res.status}`);
  const data = await res.json();
  console.log(`[scraper] API response keys: ${JSON.stringify(Object.keys(data))}, listings count: ${data.listings?.length || 0}, paging: ${JSON.stringify(data.paging)}`);
  const listings = data.listings || [];
  if (listings.length === 0) throw new Error("Listing not found in API response");

  const listing = listings[0].listing;
  const priceStr = listing.price || "";
  const priceMatch = priceStr.match(/[\d,]+/);
  const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ""), 10) : undefined;

  // Separate photos from floorplans
  const allImages = listing.media?.images || [];
  const photos = allImages.filter((img: Record<string, boolean>) => !img.floorPlan);
  const floorplans = allImages.filter((img: Record<string, boolean>) => img.floorPlan);

  const photoUrls = photos.map((img: Record<string, string>) => img.size720x480 || img.size600x600 || "").filter(Boolean).slice(0, 10);
  const floorplanUrls = floorplans.map((img: Record<string, string>) => img.size720x480 || img.size600x600 || "").filter(Boolean).slice(0, 5);

  // Extract coordinates
  const coords = listing.point?.coordinates;
  const lng = coords?.[0];
  const lat = coords?.[1];

  // Calculate days on market
  const pubDate = listing.publishDate ? new Date(listing.publishDate) : undefined;
  const daysOnMarket = pubDate ? Math.floor((Date.now() - pubDate.getTime()) / 86400000) : undefined;

  // Extract price per sqm
  const ppsqm = listing.pricePerSqM?.match(/[\d,]+/);
  const pricePerSqm = ppsqm ? parseInt(ppsqm[0].replace(/,/g, ""), 10) : undefined;

  return {
    address: (listing.title || "").replace(/,?\s*Dublin\s*\d*,?\s*Ireland/i, "").trim(),
    askingPrice: price && price > 0 ? price : undefined,
    bedrooms: listing.numBedrooms ? parseInt(String(listing.numBedrooms).match(/\d+/)?.[0] || "0", 10) || undefined : undefined,
    bathrooms: listing.numBathrooms ? parseInt(String(listing.numBathrooms).match(/\d+/)?.[0] || "0", 10) || undefined : undefined,
    ber: listing.ber?.rating,
    propertyType: inferPropertyType(listing.propertyType || listing.category || ""),
    squareMetres: listing.floorArea?.unit === "METRES_SQUARED" ? parseFloat(listing.floorArea.value) : undefined,
    neighbourhood: inferNeighbourhood(listing.title || ""),
    eircode: (listing.title || "").match(/([A-Z]\d{2}\s?[A-Z0-9]{4})/i)?.[1],
    listingUrl: originalUrl,
    images: await downloadImages(photoUrls),
    floorplanImages: await downloadImages(floorplanUrls),
    // New fields
    lat, lng,
    berEpi: listing.ber?.epi,
    pricePerSqm,
    publishDate: pubDate,
    agentName: listing.seller?.name,
    agentBranch: listing.seller?.branch,
    agentPhone: listing.seller?.phone,
  };
}

async function fetchViaHtml(url: string): Promise<ScrapedListing> {
  console.log(`[scraper] Fetching HTML: ${url}`);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-IE,en;q=0.9",
      "Referer": "https://www.daft.ie/",
      "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate", "Sec-Fetch-Site": "same-origin",
    },
  });
  console.log(`[scraper] Response: ${res.status}`);
  if (!res.ok) throw new Error(`Failed to fetch listing (${res.status}). ${res.status === 403 ? "Daft.ie is blocking automated requests — try adding the house manually." : "Check the URL."}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Try __NEXT_DATA__ JSON first (Daft is a Next.js app)
  const nextData = $('script#__NEXT_DATA__').text();
  if (nextData) {
    try {
      const json = JSON.parse(nextData);
      const listing = json.props?.pageProps?.listing;
      if (listing) {
        return {
          address: listing.title || $("h1").first().text().trim(),
          askingPrice: listing.price ? parseInt(String(listing.price).replace(/[^0-9]/g, ""), 10) : undefined,
          bedrooms: listing.numBedrooms, bathrooms: listing.numBathrooms,
          ber: listing.ber?.rating, propertyType: inferPropertyType(listing.propertyType || ""),
          squareMetres: listing.floorArea?.value ? parseFloat(listing.floorArea.value) : undefined,
          neighbourhood: inferNeighbourhood(listing.title || ""),
          eircode: (listing.title || "").match(/([A-Z]\d{2}\s?[A-Z0-9]{4})/i)?.[1],
          listingUrl: url, images: await downloadImages((listing.media?.images || []).map((i: Record<string, string>) => i.url || i.size720x480 || "").filter(Boolean).slice(0, 10)), floorplanImages: [],
        };
      }
    } catch { /* fall through to HTML parsing */ }
  }

  // Fallback: parse HTML directly
  const address = $('h1[data-testid="address"]').text().trim() || $("h1").first().text().trim() || "";
  const priceText = $('[data-testid="price"]').text() || $('span:contains("€")').first().text();
  return {
    address: address.replace(/,?\s*Dublin\s*\d*,?\s*Ireland/i, "").trim(),
    askingPrice: parsePrice(priceText),
    bedrooms: extractNumber($('[data-testid="beds"]').text() || $('p:contains("Bed")').first().text()),
    bathrooms: extractNumber($('[data-testid="baths"]').text() || $('p:contains("Bath")').first().text()),
    ber: ($('[data-testid="ber"]').text() || $('img[alt*="BER"]').attr("alt") || "").match(/([A-G][1-3]?)/i)?.[1]?.toUpperCase(),
    propertyType: inferPropertyType($('[data-testid="property-type"]').text()),
    squareMetres: (() => { const m = ($('[data-testid="floor-area"]').text() || "").match(/([\d.]+)\s*m/); return m ? parseFloat(m[1]) : undefined; })(),
    neighbourhood: inferNeighbourhood(address),
    eircode: address.match(/([A-Z]\d{2}\s?[A-Z0-9]{4})/i)?.[1],
    listingUrl: url, images: [], floorplanImages: [],
  };
}

function parsePrice(t: string) { const n = parseInt(t.replace(/[^0-9]/g, ""), 10); return n > 0 ? n : undefined; }
function extractNumber(t: string) { const m = t.match(/(\d+)/); return m ? parseInt(m[1], 10) : undefined; }

function inferPropertyType(t: string) {
  const l = t.toLowerCase();
  if (l.includes("semi")) return "semi_detached";
  if (l.includes("detach")) return "detached";
  if (l.includes("terrace")) return "terraced";
  if (l.includes("apartment") || l.includes("flat")) return "apartment";
  if (l.includes("duplex")) return "duplex";
  if (l.includes("bungalow")) return "bungalow";
  if (l.includes("house")) return "house";
  return undefined;
}

function inferNeighbourhood(address: string) {
  const areas = ["Phibsborough","Drumcondra","Glasnevin","Rathmines","Ranelagh","Portobello","Ringsend","Sandymount","Clontarf","Raheny","Killester","Artane","Beaumont","Santry","Finglas","Cabra","Stoneybatter","Smithfield","Inchicore","Kilmainham","Crumlin","Drimnagh","Walkinstown","Terenure","Rathgar","Harold's Cross","Donnybrook","Ballsbridge","Blackrock","Dun Laoghaire","Dalkey","Killiney","Stillorgan","Dundrum","Churchtown","Lucan","Clondalkin","Tallaght","Swords","Malahide","Howth","Sutton","Baldoyle","Bayside","Castleknock","Blanchardstown","Chapelizod","Palmerstown","Ballyfermot","Marino","Fairview","East Wall","North Strand"];
  for (const a of areas) if (address.toLowerCase().includes(a.toLowerCase())) return a;
  return undefined;
}

async function downloadImages(urls: string[]): Promise<string[]> {
  const dir = path.join(process.cwd(), "data", "media");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const paths: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
      const fp = path.join(dir, `${randomUUID()}.${ext}`);
      fs.writeFileSync(fp, buf);
      paths.push(fp);
    } catch { /* skip */ }
  }
  return paths;
}
