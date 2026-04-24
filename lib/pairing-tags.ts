import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import type { PairingTagsMap } from "./pairing-categories";

export type { PairingTagsMap };
export { PAIRING_CATEGORIES, type PairingId } from "./pairing-categories";

const FILE = path.join(process.cwd(), "data", "pairing-tags.json");

export function readTags(): PairingTagsMap {
  if (!existsSync(FILE)) return {};
  try {
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function writeTags(tags: PairingTagsMap): void {
  const clean: PairingTagsMap = {};
  for (const [upc, arr] of Object.entries(tags)) {
    if (arr.length > 0) clean[upc] = arr;
  }
  writeFileSync(FILE, JSON.stringify(clean, null, 2), "utf-8");
}
