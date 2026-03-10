import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

export interface ScrapedListing {
  address: string;
  askingPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  ber?: string;
  squareMetres?: number;
  neighbourhood?: string;
  eircode?: string;
  listingUrl: string;
  images: string[]; // local file paths after download
}

export async function scrapeDaftListing(url: string): Promise<ScrapedListing> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
  });
  if (!res.ok) throw new Error(`Failed to fetch listing: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Extract address from title or heading
  const address =
    $('h1[data-testid="address"]').text().trim() ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";

  // Extract price
  const priceText =
    $('[data-testid="price"]').text() ||
    $(".TitleBlock__Price").text() ||
    $('span:contains("€")').first().text();
  const askingPrice = parsePrice(priceText);

  // Extract beds/baths
  const bedsText = $('[data-testid="beds"]').text() || $('p:contains("Bed")').first().text();
  const bathsText = $('[data-testid="baths"]').text() || $('p:contains("Bath")').first().text();
  const bedrooms = extractNumber(bedsText);
  const bathrooms = extractNumber(bathsText);

  // Extract BER
  const berEl = $('[data-testid="ber"]').text() || $('img[alt*="BER"]').attr("alt") || "";
  const berMatch = berEl.match(/([A-G][1-3]?)/i);
  const ber = berMatch ? berMatch[1].toUpperCase() : undefined;

  // Extract property type
  const typeText = $('[data-testid="property-type"]').text() || $('p:contains("Property Type")').next().text();
  const propertyType = inferPropertyType(typeText);

  // Extract square metres
  const sizeText = $('[data-testid="floor-area"]').text() || $('p:contains("m²")').first().text();
  const sqmMatch = sizeText.match(/([\d.]+)\s*m/);
  const squareMetres = sqmMatch ? parseFloat(sqmMatch[1]) : undefined;

  // Extract eircode from address
  const eircodeMatch = address.match(/([A-Z]\d{2}\s?[A-Z0-9]{4})/i);
  const eircode = eircodeMatch ? eircodeMatch[1] : undefined;

  // Infer neighbourhood from address
  const neighbourhood = inferNeighbourhood(address);

  // Download images
  const imageUrls: string[] = [];
  $('img[data-testid="image"], img[src*="daft"], picture img, [data-testid="gallery"] img').each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src && src.startsWith("http") && !src.includes("logo") && !src.includes("icon")) {
      imageUrls.push(src);
    }
  });
  // Also check og:image
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage && !imageUrls.includes(ogImage)) imageUrls.unshift(ogImage);

  const images = await downloadImages(imageUrls.slice(0, 20)); // cap at 20

  return {
    address: address.replace(/,?\s*Dublin\s*\d*,?\s*Ireland/i, "").trim(),
    askingPrice,
    bedrooms,
    bathrooms,
    propertyType,
    ber,
    squareMetres,
    neighbourhood,
    eircode,
    listingUrl: url,
    images,
  };
}

function parsePrice(text: string): number | undefined {
  const cleaned = text.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return num > 0 ? num : undefined;
}

function extractNumber(text: string): number | undefined {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

function inferPropertyType(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes("semi")) return "semi_detached";
  if (lower.includes("detach")) return "detached";
  if (lower.includes("terrace") || lower.includes("end of terrace")) return "terraced";
  if (lower.includes("apartment") || lower.includes("flat")) return "apartment";
  if (lower.includes("duplex")) return "duplex";
  if (lower.includes("bungalow")) return "bungalow";
  if (lower.includes("house")) return "house";
  return undefined;
}

function inferNeighbourhood(address: string): string | undefined {
  // Common Dublin neighbourhoods
  const areas = [
    "Phibsborough", "Drumcondra", "Glasnevin", "Rathmines", "Ranelagh",
    "Portobello", "Ringsend", "Sandymount", "Clontarf", "Raheny",
    "Killester", "Artane", "Beaumont", "Santry", "Finglas",
    "Cabra", "Stoneybatter", "Smithfield", "Inchicore", "Kilmainham",
    "Crumlin", "Drimnagh", "Walkinstown", "Terenure", "Rathgar",
    "Harold's Cross", "Donnybrook", "Ballsbridge", "Blackrock", "Dun Laoghaire",
    "Dalkey", "Killiney", "Stillorgan", "Dundrum", "Churchtown",
    "Lucan", "Clondalkin", "Tallaght", "Swords", "Malahide",
    "Howth", "Sutton", "Baldoyle", "Bayside", "Castleknock",
    "Blanchardstown", "Chapelizod", "Palmerstown", "Ballyfermot",
    "Marino", "Fairview", "East Wall", "North Strand",
  ];
  for (const area of areas) {
    if (address.toLowerCase().includes(area.toLowerCase())) return area;
  }
  return undefined;
}

async function downloadImages(urls: string[]): Promise<string[]> {
  const mediaDir = path.join(process.cwd(), "data", "media");
  if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

  const paths: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
      const filename = `${randomUUID()}.${ext}`;
      const filePath = path.join(mediaDir, filename);
      fs.writeFileSync(filePath, buffer);
      paths.push(filePath);
    } catch {
      // skip failed downloads
    }
  }
  return paths;
}
