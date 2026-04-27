/**
 * Fetches product images from Go-UPC API
 * Run: node scripts/fetch-product-images.mjs
 *
 * Saves results to data/product-images-cache.json
 * Skips UPCs already cached so you can run it multiple times safely.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");
const CACHE_FILE = path.join(ROOT, "data", "product-images-cache.json");

const GO_UPC_KEY = "ed5826eaad4f987908d56ef042f675e51d216d39c3a1f2aeb477a8ef54528bfd";
const KANJI_URL  = "https://kanjiapi.com/kanjiapi/api/item?Key=78065";

const HIDDEN_DEPTS = [
  "DELIVERY FEE", "GROCERY", "Kegs", "KEG", "NOVELTY", "PROMOCODE",
  "Tobacco", "TOBACCO", "CBD", "THC", "Cigarette", "CIGARETTE",
  "CIGARS", "Cigars", "CIGAR", "Vape", "VAPE", "E-Cigarette", "E-CIGARETTE",
];

const LIMIT        = 100; // UPCitemdb free tier: 100/day
const DELAY_MS     = 800;
const USE_GO_UPC   = false; // set true when Go-UPC credits are topped up

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function loadCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try { return JSON.parse(readFileSync(CACHE_FILE, "utf-8")); } catch { return {}; }
}

function saveCache(cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

async function lookupGoUPC(upc) {
  try {
    const res = await fetch(`https://go-upc.com/api/v1/code/${upc}?key=${GO_UPC_KEY}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LiquorStore/1.0)" },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return data?.product?.imageUrl ?? null;
  } catch { return null; }
}

async function lookupUPCitemdb(upc) {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LiquorStore/1.0)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.items?.[0]?.images?.[0] ?? null;
  } catch { return null; }
}

async function lookupImage(upc) {
  if (USE_GO_UPC) {
    const img = await lookupGoUPC(upc);
    if (img) return img;
  }
  return await lookupUPCitemdb(upc);
}

async function main() {
  console.log("Fetching products from Kanji API...");
  const res = await fetch(KANJI_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LiquorStore/1.0)" },
  });
  if (!res.ok) { console.error("Failed to fetch products"); process.exit(1); }
  const allProducts = await res.json();

  const products = allProducts
    .filter(p => Number(p.CurrentStock) > 0)
    .filter(p => !HIDDEN_DEPTS.includes(p.Department))
    .filter(p => /^\d{8,14}$/.test(p.ItemUPC)); // real UPCs only

  console.log(`Total eligible products: ${products.length}`);

  const cache = loadCache();
  const alreadyCached = Object.keys(cache).filter(k => cache[k] !== null).length;
  console.log(`Already have images: ${alreadyCached}`);

  // Skip already tried (null or found), only do untried UPCs
  const todo  = products.filter(p => !(p.ItemUPC in cache));
  const batch = todo.slice(0, LIMIT);

  const source = USE_GO_UPC ? "Go-UPC → UPCitemdb fallback" : "UPCitemdb";
  console.log(`\nLooking up ${batch.length} products via ${source} (limit: ${LIMIT})...\n`);

  let found    = 0;
  let notFound = 0;

  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    process.stdout.write(`[${i + 1}/${batch.length}] ${p.ItemName.slice(0, 45).padEnd(45)} `);

    const image = await lookupImage(p.ItemUPC);
    cache[p.ItemUPC] = image;

    if (image) {
      found++;
      console.log(`✓ found`);
    } else {
      notFound++;
      console.log(`✗ not found`);
    }

    saveCache(cache);
    if (i < batch.length - 1) await sleep(DELAY_MS);
  }

  const totalWithImages = Object.values(cache).filter(v => v !== null).length;
  console.log(`\n✓ ${found} new images found, ✗ ${notFound} not found`);
  console.log(`Total products with images: ${totalWithImages}`);
  console.log(`Cache saved to data/product-images-cache.json`);
}

main().catch(console.error);
