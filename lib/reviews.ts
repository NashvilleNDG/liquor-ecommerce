import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "reviews.json");

export interface Review {
  id:        string;
  upc:       string;
  userId:    string;
  userName:  string;
  rating:    number; // 1–5
  title:     string;
  body:      string;
  createdAt: string;
  approved:  boolean;
}

export function loadReviews(): Review[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch { return []; }
}

export function saveReviews(reviews: Review[]) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(reviews, null, 2), "utf-8");
}

export function getReviewsForProduct(upc: string): Review[] {
  return loadReviews().filter((r) => r.upc === upc && r.approved);
}

export function getAverageRating(upc: string): { avg: number; count: number } {
  const reviews = getReviewsForProduct(upc);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}
