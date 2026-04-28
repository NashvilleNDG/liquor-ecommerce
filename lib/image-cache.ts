// Server-only: uses fs — never import from client components

import { existsSync, readFileSync } from "fs";
import path from "path";
import { getProductImage } from "./product-images";

export function loadImageCache(): Record<string, string | null> {
  try {
    const file = path.join(process.cwd(), "data", "product-images-cache.json");
    if (!existsSync(file)) return {};
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch { return {}; }
}

/** Resolves image from all sources: override → static map → fetched cache */
export function resolveProductImage(
  upc: string,
  overrideUrl?: string | null,
  cache?: Record<string, string | null>
): string | null {
  return overrideUrl ?? getProductImage(upc) ?? (cache ? (cache[upc] ?? null) : null);
}
