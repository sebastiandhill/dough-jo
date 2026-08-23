import { initialProducts } from "@/lib/mock-data/products";
import { bakerySettings } from "@/lib/mock-data/settings";
import { addDays } from "@/lib/dates";

export interface SalesRecord {
  date: Date;
  productId: string;
  quantity: number;
  money: number;
}

function seededRandom(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** A deterministic, fabricated ~400-day sales history for the admin Totals
 * tab — this is historical/aggregate reporting, distinct from the live
 * week-by-week order book on the Baking tab. Memoized so it's computed once. */
let cached: SalesRecord[] | null = null;

export function getSalesHistory(): SalesRecord[] {
  if (cached) return cached;
  const out: SalesRecord[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 400; i++) {
    const d = addDays(today, -i);
    if (!bakerySettings.availableBakeWeekdays.includes(d.getDay())) continue;
    initialProducts.forEach((p, pi) => {
      const seed = i * 7 + pi * 31;
      const qty = Math.round(seededRandom(seed) * (p.maxPerBakeDay + 1));
      if (qty > 0) {
        out.push({ date: d, productId: p.id, quantity: qty, money: qty * p.price });
      }
    });
  }

  cached = out;
  return out;
}
