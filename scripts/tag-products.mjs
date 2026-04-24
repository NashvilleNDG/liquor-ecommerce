/**
 * Fetches all products from the Kanji API and auto-assigns food pairing tags
 * based on product name matching. Run with: node scripts/tag-products.mjs
 */

import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE  = path.join(__dirname, "../data/pairing-tags.json");

const API_BASE = "https://kanjiapi.com/kanjiapi/api";
const API_KEY  = "78065";

// ── Pairing rules ─────────────────────────────────────────────────────────────
// Each entry: [regex or string (case-insensitive), [...tags]]
// Rules are checked top-to-bottom; ALL matching rules are applied (additive).

const RULES = [

  // ── WINES ────────────────────────────────────────────────────────────────

  // Chardonnay
  [/chardonnay/i,                      ["cheese", "poultry", "fish"]],

  // Sauvignon Blanc
  [/sauvignon\s*blanc/i,               ["fish", "cheese", "fruits_veggies"]],
  [/\bsauv\s*blanc\b/i,                ["fish", "cheese", "fruits_veggies"]],

  // Pinot Grigio / Gris
  [/pinot\s*gri(gio|s)/i,              ["fish", "italian", "poultry"]],

  // Pinot Noir
  [/pinot\s*noir/i,                    ["poultry", "meat", "italian"]],

  // Cabernet Sauvignon / Franc / Cab
  [/cabernet\s*sauvignon/i,            ["meat", "cheese"]],
  [/cabernet\s*franc/i,                ["meat", "cheese"]],
  [/\bcab\s*sauv\b/i,                  ["meat", "cheese"]],

  // Merlot
  [/\bmerlot\b/i,                      ["meat", "italian", "cheese"]],

  // Malbec
  [/\bmalbec\b/i,                      ["meat", "bbq"]],

  // Syrah / Shiraz
  [/\b(syrah|shiraz)\b/i,              ["meat", "bbq"]],

  // Zinfandel
  [/\bzinfandel\b/i,                   ["bbq", "meat", "american", "italian"]],

  // Sangiovese / Chianti / Brunello / Barolo
  [/\b(sangiovese|chianti|brunello|barolo|amarone|valpolicella)\b/i, ["italian", "meat"]],

  // Tempranillo / Rioja / Grenache
  [/\b(tempranillo|rioja|grenache|garnacha)\b/i, ["meat", "cheese"]],

  // Riesling
  [/\briesling\b/i,                    ["asian", "indian", "fish", "poultry"]],

  // Gewürztraminer / Torrontés
  [/\b(gewurztraminer|gewürztraminer|torrontes|torrontés)\b/i, ["asian", "indian"]],

  // Moscato / Muscat
  [/\b(moscato|muscat)\b/i,            ["dessert", "fruits_veggies"]],

  // Prosecco / Champagne / Cava / Sparkling / Cremant
  [/\b(prosecco|champagne|cava|cremant|crémant|franciacorta|sekt|sparkling)\b/i, ["cheese", "dessert", "fruits_veggies"]],
  [/\bbrut\b/i,                        ["cheese", "fruits_veggies"]],

  // Port / Sherry / Madeira / Dessert wines
  [/\b(port|porto|sherry|madeira|ice\s*wine|late\s*harvest|sauternes|tokay|tokaji|beerenauslese|trockenbeerenauslese)\b/i, ["dessert", "cheese"]],

  // Rosé
  [/\b(ros[eé]|rosato)\b/i,            ["fish", "poultry", "fruits_veggies", "cheese"]],

  // Viognier / Roussanne / Marsanne
  [/\b(viognier|roussanne|marsanne)\b/i, ["poultry", "fish"]],

  // Albariño / Alvarinho / Vinho Verde / Verdejo / Muscadet / Chablis
  [/\b(albari[nñ]o|alvarinho|vinho\s*verde|verdejo|muscadet|chablis|vermentino|soave)\b/i, ["fish", "italian"]],

  // Grenache Blanc / White Rioja / White Bordeaux
  [/white\s*(rioja|bordeaux|burgundy)/i, ["fish", "poultry"]],

  // Bordeaux (red blend signal)
  [/\bbordeaux\b/i,                    ["meat", "cheese"]],

  // Red Blend / Meritage
  [/\b(red\s*blend|meritage|gsm|super\s*tuscan)\b/i, ["meat", "italian"]],

  // ── SPIRITS ──────────────────────────────────────────────────────────────

  // Bourbon
  [/\bbourbon\b/i,                     ["american", "bbq", "meat"]],

  // Tennessee Whiskey
  [/tennessee\s*whiskey/i,             ["american", "bbq"]],

  // Rye Whiskey
  [/\brye\s*whiskey\b/i,               ["american", "meat"]],

  // Scotch / Single Malt / Blended Scotch
  [/\b(scotch|single\s*malt|blended\s*scotch|highland|speyside|islay|lowland|campbeltown)\b/i, ["cheese", "meat", "bbq"]],

  // Irish Whiskey
  [/irish\s*whiskey/i,                 ["american", "meat"]],

  // Canadian Whisky
  [/canadian\s*whisky/i,               ["american"]],

  // Japanese Whisky
  [/japanese\s*whisky/i,               ["asian", "meat"]],

  // Generic Whiskey/Whisky (catch-all)
  [/\bwhiskey\b/i,                     ["american", "bbq", "meat"]],
  [/\bwhisky\b/i,                      ["american", "meat"]],

  // Tequila
  [/\btequila\b/i,                     ["mexican"]],
  [/\b(blanco|reposado|anejo|añejo|extra\s*an[eé]jo)\b/i, ["mexican"]],

  // Mezcal / Sotol / Raicilla
  [/\b(mezcal|sotol|raicilla)\b/i,     ["mexican"]],

  // Vodka
  [/\bvodka\b/i,                       ["american", "asian", "fish"]],

  // Gin
  [/\bgin\b/i,                         ["american", "fish"]],

  // Rum (light / silver)
  [/\b(white\s*rum|silver\s*rum|light\s*rum|rum\s*blanco)\b/i, ["american", "mexican"]],

  // Rum (dark / aged / spiced)
  [/\b(dark\s*rum|aged\s*rum|spiced\s*rum|ron|añejo\s*rum|gold\s*rum|amber\s*rum)\b/i, ["dessert", "american", "bbq"]],

  // Generic rum catch-all
  [/\brum\b/i,                         ["american"]],

  // Brandy / Cognac / Armagnac
  [/\b(brandy|cognac|armagnac|calvados|pisco)\b/i, ["dessert", "cheese"]],

  // Liqueurs – dessert
  [/\b(amaretto|kahlua|kahlúa|baileys|frangelico|tia\s*maria|disaronno|godiva|creme\s*de\s*cacao|creme\s*de\s*menthe|limoncello|sambuca|anisette|chambord)\b/i, ["dessert"]],

  // Liqueurs – Italian
  [/\b(campari|aperol|cynar|fernet|amaro|averna|ramazzotti|luxardo|maraschino|strega|galliano|grappa)\b/i, ["italian", "dessert"]],

  // Liqueurs – Asian
  [/\b(midori|yuzu|lychee|sake|soju|shochu|baijiu|umeshu)\b/i, ["asian"]],

  // Sake
  [/\bsake\b/i,                        ["asian", "fish"]],

  // Triple Sec / Cointreau / Grand Marnier / Curaçao
  [/\b(triple\s*sec|cointreau|grand\s*marnier|curacao|cura[çc]ao|blue\s*curacao)\b/i, ["dessert", "mexican"]],

  // Absinthe / Pastis / Pernod
  [/\b(absinthe|pastis|pernod|ricard)\b/i, ["cheese", "dessert"]],

  // Schnapps / Peach / Apple / Sour
  [/\bschnapps\b/i,                    ["dessert"]],

  // ── BEER ─────────────────────────────────────────────────────────────────

  // Mexican beers
  [/\b(corona|modelo|dos\s*equis|pacifico|sol\b|tecate|carta\s*blanca|victoria\b|bohemia|indio\b|negro\s*modelo|superior\b)\b/i, ["mexican"]],

  // Classic American macros
  [/\b(budweiser|bud\s*light|miller\s*lite|miller\s*high\s*life|coors\b|coors\s*light|michelob|natural\s*light|pabst|pbr|keystone|busch\b|old\s*milwaukee|hamm[''']?s|genesee|stroh[''']?s|schlitz|lone\s*star|shiner|yuengling|leinenkugel|sam\s*adams|samuel\s*adams)\b/i, ["american"]],

  // Hard seltzer
  [/\b(white\s*claw|truly\b|bud\s*light\s*seltzer|high\s*noon|vizzy|topo\s*chico|michelob\s*ultra\s*seltzer|corona\s*seltzer)\b/i, ["american", "fruits_veggies"]],

  // Hard cider
  [/\b(hard\s*cider|cider\b|angry\s*orchard|woodchuck|strongbow|magners|rekorderlig)\b/i, ["poultry", "fruits_veggies"]],

  // European lagers
  [/\b(heineken|stella\s*artois|amstel|peroni|moretti|beck[''']?s|st\.\s*pauli|carlsberg|fosters|kronenbourg|san\s*miguel|efes|tusker|kingfisher|tiger\b|tsingtao|sapporo|asahi|kirin|orion\b|hitachino|sapporo)\b/i, ["fish", "american"]],

  // Belgian
  [/\b(leffe|chimay|duvel|delirium|orval|rochefort|westmalle|la\s*trappe|kwak|wittekerke|hoegaarden|allagash|ommegang|new\s*belgium\s*trippel)\b/i, ["cheese", "dessert"]],

  // IPA / India Pale
  [/\b(ipa|india\s*pale\s*ale|imperial\s*ipa|double\s*ipa|session\s*ipa|hazy\s*ipa|west\s*coast\s*ipa|new\s*england\s*ipa|neipa)\b/i, ["american", "bbq", "indian", "mexican"]],

  // Pale Ale
  [/\b(pale\s*ale|apa|american\s*pale)\b/i, ["american", "bbq"]],

  // Amber / Red Ale
  [/\b(amber\s*ale|red\s*ale|irish\s*red)\b/i, ["american", "bbq", "meat"]],

  // Brown Ale
  [/\bbrown\s*ale\b/i,                 ["american", "meat", "bbq"]],

  // Stout / Porter
  [/\b(stout|porter\b|imperial\s*stout|oatmeal\s*stout|milk\s*stout|foreign\s*extra)\b/i, ["bbq", "meat", "dessert"]],

  // Guinness specifically
  [/\bguinness\b/i,                    ["meat", "bbq", "dessert"]],

  // Wheat Beer / Hefeweizen / Witbier
  [/\b(wheat\s*beer|hefeweizen|wit\b|witbier|white\s*ale|blanche|weizen|weiss)\b/i, ["poultry", "fish", "american"]],

  // Blue Moon
  [/\bblue\s*moon\b/i,                 ["american", "poultry"]],

  // Pilsner / Lager (generic)
  [/\b(pilsner|pilsener|lager|helles|märzen|marzen|oktoberfest|bock\b|doppelbock|kolsch|kölsch|cream\s*ale)\b/i, ["american", "fish", "poultry"]],

  // Sour Beer / Lambic / Gose / Berliner Weisse
  [/\b(sour\b|sour\s*ale|lambic|gueuze|gose|berliner\s*weisse|flanders|kriek)\b/i, ["fruits_veggies", "dessert", "cheese"]],

  // Barrel-aged / Imperial
  [/\b(barrel[- ]aged|bourbon\s*barrel|wood[- ]aged|imperial\b)\b/i, ["american", "bbq", "dessert"]],

  // Craft beer catch-alls by style keywords
  [/\b(session\s*ale|blonde\s*ale|golden\s*ale|summer\s*ale|farmhouse\s*ale|saison|biere\s*de)\b/i, ["american", "poultry"]],

  // ── CATCH-ALLS BY DEPARTMENT ─────────────────────────────────────────────

  // Any wine not matched → american, cheese (safe defaults)
  // Handled at runtime if 0 tags assigned
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTags(product) {
  const name = (product.ItemName || "").toString();
  const dept = (product.Department || "").toString().toUpperCase();
  const tags  = new Set();

  for (const [pattern, pairings] of RULES) {
    const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
    if (regex.test(name)) {
      for (const t of pairings) tags.add(t);
    }
  }

  // Department-level fallbacks when no specific rule matched
  if (tags.size === 0) {
    if (dept.includes("WINE") || dept === "WINES") {
      // Generic wine → cheese and poultry
      tags.add("cheese");
      tags.add("poultry");
    } else if (dept === "LIQUOR") {
      // Generic spirit → american
      tags.add("american");
    } else if (dept === "BEER") {
      // Generic beer → american
      tags.add("american");
    }
  }

  return [...tags];
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log("Fetching products from Kanji API…");

const res = await fetch(`${API_BASE}/item?Key=${API_KEY}`, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; StonesRiverTagger/1.0)" },
});
if (!res.ok) {
  console.error(`API error: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const allProducts = await res.json();
if (!Array.isArray(allProducts)) {
  console.error("Unexpected API response:", typeof allProducts);
  process.exit(1);
}

console.log(`Fetched ${allProducts.length} products. Tagging…`);

const tagMap = {};
const stats  = {};

for (const product of allProducts) {
  if (Number(product.CurrentStock) <= 0) continue; // skip out-of-stock

  const tags = getTags(product);
  if (tags.length > 0) {
    tagMap[product.ItemUPC] = tags;
    for (const t of tags) stats[t] = (stats[t] ?? 0) + 1;
  }
}

writeFileSync(OUT_FILE, JSON.stringify(tagMap, null, 2), "utf-8");

const tagged = Object.keys(tagMap).length;
const total  = allProducts.filter((p) => Number(p.CurrentStock) > 0).length;

console.log(`\n✅ Done! Tagged ${tagged} of ${total} in-stock products.\n`);
console.log("Tags applied:");
for (const [tag, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${tag.padEnd(16)} ${count}`);
}
console.log(`\nSaved → ${OUT_FILE}`);
