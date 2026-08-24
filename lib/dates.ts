import { bakerySettings } from "@/lib/mock-data/settings";
import type { Order, PickupDate, Product, RecurringOrder } from "@/lib/types";
import { recurringOrdersForDate } from "@/lib/recurring";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatWeekday(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Per-product remaining units for one pickup date: starts from each
 * available product's admin-set cap, then reserves recurring customers'
 * projected orders FIRST (so a regular never loses their loaf to a one-time
 * order placed later), then subtracts real orders already on the books. */
export function remainingCapacityForDate(
  dateId: string,
  products: Product[],
  orders: Order[],
  recurringOrders: RecurringOrder[]
): Record<string, number> {
  const remaining: Record<string, number> = {};
  products.forEach((p) => {
    if (p.available) remaining[p.id] = p.maxPerBakeDay;
  });

  const ordersForDate = orders.filter((o) => o.pickupDateId === dateId);

  // Recurring reservations, skipping any that already have a real order on
  // the books for this date (already accounted for below, in step 2).
  recurringOrdersForDate(recurringOrders, dateId).forEach((r) => {
    const materialized = ordersForDate.some(
      (o) => o.recurringOrderId === r.id
    );
    if (materialized) return;
    r.items.forEach((item) => {
      if (remaining[item.productId] != null) {
        remaining[item.productId] -= item.quantity;
      }
    });
  });

  // Real orders already placed for this date (one-time and materialized
  // recurring alike).
  ordersForDate.forEach((o) => {
    o.items.forEach((item) => {
      if (remaining[item.productId] != null) {
        remaining[item.productId] -= item.quantity;
      }
    });
  });

  return remaining;
}

/** Whether a specific cart of items can actually be fulfilled on this date —
 * i.e. every item's quantity fits within what's left after recurring
 * reservations and existing orders. This is the real enforcement behind
 * "a regular never loses their loaf": it's checked before a one-time order
 * can be placed, not just shown as a hint. */
export function canFulfillOnDate(
  items: { productId: string; quantity: number }[],
  dateId: string,
  products: Product[],
  orders: Order[],
  recurringOrders: RecurringOrder[]
): boolean {
  const remaining = remainingCapacityForDate(dateId, products, orders, recurringOrders);
  return items.every((item) => (remaining[item.productId] ?? 0) >= item.quantity);
}

/** Generates the next N available pickup dates, honoring the bakery's lead
 * time and bake-day schedule, with live remaining-capacity figures that
 * reflect current product caps/visibility and real + recurring demand. */
export function getAvailablePickupDates(
  products: Product[],
  orders: Order[],
  recurringOrders: RecurringOrder[],
  count = 4
): PickupDate[] {
  const today = startOfToday();
  const out: PickupDate[] = [];

  for (
    let i = bakerySettings.leadTimeDays;
    i <= 60 && out.length < count;
    i++
  ) {
    const d = addDays(today, i);
    if (!bakerySettings.availableBakeWeekdays.includes(d.getDay())) continue;

    const key = toISODate(d);
    const perProduct = remainingCapacityForDate(
      key,
      products,
      orders,
      recurringOrders
    );
    const remaining = Object.values(perProduct).reduce(
      (sum, n) => sum + Math.max(0, n),
      0
    );
    if (remaining <= 0) continue;

    out.push({
      id: key,
      date: key,
      weekday: formatWeekday(d),
      label: formatShortDate(d),
      long: formatLongDate(d),
      pickupWindow: bakerySettings.pickupWindow,
      available: true,
      remainingCapacity: remaining,
    });
  }

  return out;
}

/** Formats any pickup date id (past, present, or future) for display — e.g.
 * on a confirmation or order-history screen, where the order may already be
 * behind us and so wouldn't appear in the forward-looking availability list. */
export function getPickupDateById(id: string): PickupDate | undefined {
  const d = new Date(`${id}T12:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return {
    id,
    date: id,
    weekday: formatWeekday(d),
    label: formatShortDate(d),
    long: formatLongDate(d),
    pickupWindow: bakerySettings.pickupWindow,
    available: true,
    remainingCapacity: 0,
  };
}

/** Bake dates (Tue/Wed) for a given week offset from the current week,
 * used by the admin dashboard's week navigator. Monday-start weeks. */
export function bakeDatesForWeek(weekOffset: number): Date[] {
  const today = startOfToday();
  const monday = addDays(
    today,
    -((today.getDay() + 6) % 7) + weekOffset * 7
  );
  return [1, 2].map((n) => addDays(monday, n));
}

export function weekStartForOffset(weekOffset: number): Date {
  const today = startOfToday();
  return addDays(today, -((today.getDay() + 6) % 7) + weekOffset * 7);
}

/** Next occurrence of a given weekday (0=Sun..6=Sat) on or after `afterDate`
 * (defaults to today + the bakery's lead time). Used by the recurring-order
 * flow, including advancing a schedule forward when a pickup is skipped. */
export function nextDateForWeekday(weekday: number, afterDate?: Date): Date {
  const earliest = afterDate ?? addDays(startOfToday(), bakerySettings.leadTimeDays);
  let d = earliest;
  while (d.getDay() !== weekday) d = addDays(d, 1);
  return d;
}

/** Next Nth (1-4) occurrence of a weekday within a month, on or after
 * `afterDate` (defaults to today + lead time) — e.g. "the 2nd Wednesday". */
export function nextMonthlyDate(
  weekday: number,
  weekOfMonth: number,
  afterDate?: Date
): Date {
  const earliest = afterDate ?? addDays(startOfToday(), bakerySettings.leadTimeDays);
  for (let m = 0; m < 6; m++) {
    const probe = new Date(earliest.getFullYear(), earliest.getMonth() + m, 1);
    const shift = (weekday - probe.getDay() + 7) % 7;
    const nth = new Date(
      probe.getFullYear(),
      probe.getMonth(),
      1 + shift + (weekOfMonth - 1) * 7
    );
    if (nth.getMonth() === probe.getMonth() && nth >= earliest) return nth;
  }
  return earliest;
}

/** Advances a recurring order's schedule to its next pickup after
 * `currentDateId`, e.g. when a customer skips one. */
export function advanceRecurringDate(
  currentDateId: string,
  frequency: "weekly" | "every-other" | "monthly",
  weekday: number,
  weekOfMonth?: number
): Date {
  const current = new Date(`${currentDateId}T12:00:00`);
  if (frequency === "weekly") return addDays(current, 7);
  if (frequency === "every-other") return addDays(current, 14);
  return nextMonthlyDate(weekday, weekOfMonth ?? 1, addDays(current, 1));
}
