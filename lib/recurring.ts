import type { RecurringOrder } from "@/lib/types";

/** True if an active recurring order has a pickup occurrence on this date,
 * projected from its anchor date and cadence — not from any single stored
 * "next pickup" value, so it works for any date, arbitrarily far out. */
export function recurringOccursOn(order: RecurringOrder, dateId: string): boolean {
  if (order.status !== "active") return false;
  if (order.skippedDateIds.includes(dateId)) return false;

  const target = new Date(`${dateId}T12:00:00`);
  if (target.getDay() !== order.weekday) return false;

  const anchor = new Date(`${order.anchorDateId}T12:00:00`);
  if (target < anchor) return false;

  if (order.frequency === "monthly") {
    const nthOfMonth = Math.floor((target.getDate() - 1) / 7) + 1;
    const anchorNth = Math.floor((anchor.getDate() - 1) / 7) + 1;
    return nthOfMonth === (order.weekOfMonth ?? anchorNth);
  }

  const days = Math.round((target.getTime() - anchor.getTime()) / 86400000);
  return order.frequency === "weekly" ? days % 7 === 0 : days % 14 === 0;
}

/** Every active recurring order with a projected occurrence on this date. */
export function recurringOrdersForDate(
  recurringOrders: RecurringOrder[],
  dateId: string
): RecurringOrder[] {
  return recurringOrders.filter((r) => recurringOccursOn(r, dateId));
}
