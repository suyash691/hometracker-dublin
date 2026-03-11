// Daft.ie scraper — uses internal API to bypass Cloudflare
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

export interface ScrapedListing {
  address: string; askingPrice?: number; bedrooms?: number; bathrooms?: number;
  propertyType?: string; ber?: string; squareMetres?: number; neighbourhood?: string;
  eircode?: string; listingUrl: string; images: string[];
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
  // Step 1: Hit the Daft.ie homepage first to get Cloudflare cookies
  const session = await fetch("https://www.daft.ie/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
  });
  // Extract any cookies from the response
  const cookies = session.headers.get("set-cookie") || "";

  // Step 2: Fetch the listing page with the cookies
  const res = await fetch(originalUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-IE,en;q=0.9",
      "Referer": "https://www.daft.ie/",
      "Cookie": cookies,
      "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate", "Sec-Fetch-Site": "same-origin",
    },
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`Daft fetch returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const nextData = $('script#__NEXT_DATA__').text();
  if (!nextData) throw new Error("No __NEXT_DATA__ found");

  const json = JSON.parse(nextData);
  const listing = json.props?.pageProps?.listing;
  if (!listing) throw new Error("No listing data in __NEXT_DATA__");

  return {
    address: (listing.title || "").replace(/,?\s*Dublin\s*\d*,?\s*Ireland/i, "").trim(),
    askingPrice: listing.price ? parseInt(String(listing.price).replace(/[^0-9]/g, ""), 10) : undefined,
    bedrooms: listing.numBedrooms, bathrooms: listing.numBathrooms,
    ber: listing.ber?.rating, propertyType: inferPropertyType(listing.propertyType || listing.category || ""),
    squareMetres: listing.floorArea?.value ? parseFloat(listing.floorArea.value) : undefined,
    neighbourhood: inferNeighbourhood(listing.title || ""),
    eircode: (listing.title || "").match(/([A-Z]\d{2}\s?[A-Z0-9]{4})/i)?.[1],
    listingUrl: originalUrl,
    images: await downloadImages((listing.media?.images || []).map((i: Record<string, string>) => i.size720x480 || i.url || "").filter(Boolean).slice(0, 10)),
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
          listingUrl: url, images: await downloadImages((listing.media?.images || []).map((i: Record<string, string>) => i.url || i.size720x480 || "").filter(Boolean).slice(0, 10)),
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
    listingUrl: url, images: [],
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
