export type PairingTagsMap = Record<string, string[]>;

export const PAIRING_CATEGORIES = [
  { id: "cheese",         label: "Cheese",           emoji: "🧀" },
  { id: "meat",           label: "Meat",             emoji: "🥩" },
  { id: "poultry",        label: "Poultry",          emoji: "🍗" },
  { id: "fish",           label: "Fish",             emoji: "🐟" },
  { id: "fruits_veggies", label: "Fruits & Veggies", emoji: "🥗" },
  { id: "dessert",        label: "Dessert",          emoji: "🍮" },
  { id: "italian",        label: "Italian",          emoji: "🍝" },
  { id: "asian",          label: "Asian",            emoji: "🍜" },
  { id: "mexican",        label: "Mexican",          emoji: "🌮" },
  { id: "american",       label: "American",         emoji: "🍔" },
  { id: "indian",         label: "Indian",           emoji: "🍛" },
  { id: "bbq",            label: "BBQ",              emoji: "🔥" },
] as const;

export type PairingId = (typeof PAIRING_CATEGORIES)[number]["id"];
