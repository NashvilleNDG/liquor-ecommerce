import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const OVERRIDES_FILE = path.join(process.cwd(), "data", "product-overrides.json");

export interface ProductOverride {
  hidden?:      boolean;
  featured?:    boolean;
  label?:       string;
  onlinePrice?: number;
  imageUrl?:    string;
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
  const all = readOverrides();
  const merged: ProductOverride = { ...(all[upc] ?? {}), ...patch };

  // Strip falsy / undefined values so the JSON stays clean
  const cleaned: ProductOverride = {};
  if (merged.hidden)      cleaned.hidden      = true;
  if (merged.featured)    cleaned.featured    = true;
  if (merged.label)       cleaned.label       = merged.label;
  if (merged.onlinePrice) cleaned.onlinePrice = merged.onlinePrice;
  if (merged.imageUrl)    cleaned.imageUrl    = merged.imageUrl;

  if (Object.keys(cleaned).length === 0) {
    delete all[upc];
  } else {
    all[upc] = cleaned;
  }

  writeOverrides(all);
  return all;
}

export function deleteOverride(upc: string): OverridesMap {
  const all = readOverrides();
  delete all[upc];
  writeOverrides(all);
  return all;
}
