import { readFileSync, existsSync } from "fs";
import path from "path";
import type { Deal } from "@/app/api/deals/route";
import DealsAdminClient from "./DealsAdminClient";

export const dynamic = "force-dynamic";

function readDeals(): Deal[] {
  const file = path.join(process.cwd(), "data", "deals.json");
  if (!existsSync(file)) return [];
  try { return JSON.parse(readFileSync(file, "utf-8")); } catch { return []; }
}

export default function AdminDealsPage() {
  return <DealsAdminClient initialDeals={readDeals()} />;
}
