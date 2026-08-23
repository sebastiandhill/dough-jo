import { bakerySettings } from "@/lib/mock-data/settings";
import { initialProducts } from "@/lib/mock-data/products";
import type { PickupDate } from "@/lib/types";

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

/** Deterministic pseudo-random 0..1, seeded by an integer, so the mock
 * capacity pattern is stable across renders/reloads instead of flickering. */
function seededRandom(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const totalDailyCapacity = initialProducts.reduce(
  (sum, p) => sum + p.maxPerBakeDay,
  0
);

/** Simulates other customers having already booked part of a bake day's
 * capacity, so the date picker isn't uniformly wide open. */
function bookedForDate(dayIndex: number): number {
  const pattern = [4, totalDailyCapacity - 2, 1, 0];
  const base = pattern[dayIndex % pattern.length];
  const jitter = Math.floor(seededRandom(dayIndex) * 3);
  return Math.min(totalDailyCapacity, base + jitter);
}

/** Generates the next N available pickup dates, honoring the bakery's lead
 * time and bake-day schedule, with mock remaining-capacity figures. */
export function getAvailablePickupDates(count = 4): PickupDate[] {
  const today = startOfToday();
  const out: PickupDate[] = [];
  let dayIndex = 0;

  for (
    let i = bakerySettings.leadTimeDays;
    i <= 60 && out.length < count;
    i++
  ) {
    const d = addDays(today, i);
    if (!bakerySettings.availableBakeWeekdays.includes(d.getDay())) continue;

    const key = toISODate(d);
    const remaining = totalDailyCapacity - bookedForDate(dayIndex);
    dayIndex++;
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
