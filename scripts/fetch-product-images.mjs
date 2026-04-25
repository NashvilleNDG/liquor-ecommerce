/**
 * Fetches product images from UPC Item DB (free trial: 100 requests/day)
 * Run: node scripts/fetch-product-images.mjs
 *
 * Saves results to data/product-images-cache.json
 * Skips UPCs already cached so you can run it multiple times safely.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CACHE_FILE = path.join(ROOT, "data", "product-images-cache.json");
const KANJI_KEY = "78065";
const KANJI_URL = `https://kanjiapi.com/kanjiapi/api/item?Key=${KANJI_KEY}`;

const HIDDEN_DEPTS = [
  "DELIVERY FEE", "GROCERY", "Kegs", "KEG", "NOVELTY", "PROMOCODE",
  "Tobacco", "TOBACCO", "CBD", "THC", "Cigarette", "CIGARETTE",
  "CIGARS", "Cigars", "CIGAR", "Vape", "VAPE", "E-Cigarette", "E-CIGARETTE",
];

const LIMIT = 100; // free plan daily limit
const DELAY_MS = 800; // be polite to the API

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try { return JSON.parse(readFileSync(CACHE_FILE, "utf-8")); } catch { return {}; }
}

function saveCache(cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

async function lookupUPC(upc) {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LiquorStore/1.0)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.items?.[0];
    if (!item) return null;
    const image = item.images?.[0] ?? null;
    return image;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Fetching products from Kanji API...");
  const res = await fetch(KANJI_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LiquorStore/1.0)" },
  });
  if (!res.ok) { console.error("Failed to fetch products"); process.exit(1); }
  const allProducts = await res.json();

  const products = allProducts
    .filter((p) => Number(p.CurrentStock) > 0)
    .filter((p) => !HIDDEN_DEPTS.includes(p.Department));

  console.log(`Total eligible products: ${products.length}`);

  const cache = loadCache();
  const alreadyCached = Object.keys(cache).length;
  console.log(`Already cached: ${alreadyCached} images`);

  const todo = products
    .filter((p) => /^\d{8,14}$/.test(p.ItemUPC)) // real UPCs only
    .filter((p) => !(p.ItemUPC in cache));         // not already cached
  const batch = todo.slice(0, LIMIT);

  console.log(`Fetching images for ${batch.length} products (limit: ${LIMIT}/day)...\n`);

  let found = 0;
  let notFound = 0;

  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    process.stdout.write(`[${i + 1}/${batch.length}] ${p.ItemName.slice(0, 50).padEnd(50)} `);

    const image = await lookupUPC(p.ItemUPC);
    cache[p.ItemUPC] = image; // store null if not found so we skip next time

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

  console.log(`\nDone! ✓ ${found} images found, ✗ ${notFound} not found`);
  console.log(`Cache saved to data/product-images-cache.json`);
  console.log(`Total cached entries: ${Object.keys(cache).length}`);
}

main().catch(console.error);
