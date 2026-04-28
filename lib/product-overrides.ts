import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const OVERRIDES_FILE = path.join(process.cwd(), "data", "product-overrides.json");

export interface ProductDiscount {
  type:  "percent" | "fixed";
  value: number;
}

export interface ProductOverride {
  // Visibility & merchandising
  hidden?:    boolean;
  featured?:  boolean;
  label?:     string;

  // Pricing
  onlinePrice?: number;
  discount?:    ProductDiscount;

  // Website content (does NOT reflect in POS)
  websiteName?:      string;
  subtitle?:         string;
  description?:      string;

  // Images
  imageUrl?:         string;
  additionalImages?: string[];

  // Taxonomy
  types?:    string[];
  subTypes?: string[];
  brand?:    string;
  country?:  string;
  region?:   string;
  varietal?: string;
}

export type OverridesMap = Record<string, ProductOverride>;

export function readOverrides(): OverridesMap {
  try {
    if (!existsSync(OVERRIDES_FILE)) return {};
    return JSON.parse(readFileSync(OVERRIDES_FILE, "utf-8"));
  } catch { return {}; }
}

export function writeOverrides(overrides: OverridesMap): void {
  writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), "utf-8");
}

export function upsertOverride(upc: string, patch: ProductOverride): OverridesMap {
  const all    = readOverrides();
  const merged = { ...(all[upc] ?? {}), ...patch };

  // Remove keys explicitly set to null/undefined/empty (cleanup)
  const cleaned: ProductOverride = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string"  && v.trim() === "") continue;
    if (Array.isArray(v)       && v.length === 0)  continue;
    if (typeof v === "boolean" && v === false)      continue;
    (cleaned as Record<string, unknown>)[k] = v;
  }

  if (Object.keys(cleaned).length === 0) delete all[upc];
  else all[upc] = cleaned;

  writeOverrides(all);
  return all;
}

export function deleteOverride(upc: string): OverridesMap {
  const all = readOverrides();
  delete all[upc];
  writeOverrides(all);
  return all;
}

/** Compute the final displayed price after override + discount */
export function resolvePrice(basePrice: number, ov: ProductOverride): number {
  const price = ov.onlinePrice ?? basePrice;
  if (!ov.discount) return price;
  return ov.discount.type === "percent"
    ? price * (1 - ov.discount.value / 100)
    : Math.max(0, price - ov.discount.value);
}
