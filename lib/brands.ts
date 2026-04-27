/**
 * Brand extraction utilities.
 *
 * Rules:
 * - Take up to 2 words as brand name
 * - Stop at any word that looks like a size/quantity (750ML, 6PK, 1.75L, etc.)
 * - Stop at standalone bare numbers (e.g. "750", "1.75")
 * - Known 1-word brands (e.g. Smirnoff, Barefoot) naturally stop because word 2 is a size
 */

// Matches size tokens: 750ML, 1.75L, 1LTR, 6PK, 4CT, 12OZ, 1GAL, 19.2OZ, etc.
const SIZE_PATTERN = /^(\d+(\.\d+)?(ML|OZ|L|LTR|PK|CT|GAL|X\d)|\d+(PK|OZ|ML|CT))/i;
// A bare standalone number like "750", "1.75", "375"
const BARE_NUMBER = /^\d+(\.\d+)?$/;

// Known 3-word brands that need a special override
const THREE_WORD_BRANDS: string[] = [
  "ON THE ROCKS",
  "A TO Z",
  "THREE OLIVES",
  "FESS PARKER",
  "HIGH WEST",
];

export function extractBrand(itemName: string): string {
  const upper = itemName.trim().toUpperCase();

  // Check 3-word brand overrides first
  for (const b of THREE_WORD_BRANDS) {
    if (upper.startsWith(b)) return b;
  }

  const words = itemName.trim().split(/\s+/);
  if (words.length === 0) return itemName.trim();

  const w0 = words[0];
  const w1 = words[1] ?? "";

  // If first word is a size, just return it (edge case)
  if (SIZE_PATTERN.test(w0)) return w0;

  // If there's no second word, or second word is a size/bare number → 1-word brand
  if (!w1 || SIZE_PATTERN.test(w1) || BARE_NUMBER.test(w1)) {
    return w0;
  }

  // Default: take 2 words as brand
  return `${w0} ${w1}`;
}

export function normalizeBrand(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
