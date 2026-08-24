"use client";

import { useState } from "react";
import Link from "next/link";
import { useDough } from "@/lib/store";
import { mockCustomer } from "@/lib/mock-data/seed-customer";
import {
  nextDateForWeekday,
  nextMonthlyDate,
  toISODate,
  formatLongDate,
  canFulfillOnDate,
} from "@/lib/dates";
import { itemsTotal, cx } from "@/lib/utils";
import type { OrderItem, RecurringFrequency } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

const FREQUENCIES: { id: RecurringFrequency; label: string; cadence: string; per: string }[] = [
  { id: "weekly", label: "Every week", cadence: "Every ", per: "every week" },
  { id: "every-other", label: "Every other week", cadence: "Every other ", per: "every 2 weeks" },
  { id: "monthly", label: "Every month", cadence: "Monthly, on the first ", per: "every month" },
];

const WEEKS = [
  { n: 1, label: "1st" },
  { n: 2, label: "2nd" },
  { n: 3, label: "3rd" },
  { n: 4, label: "4th" },
];

const DAYS = [
  { n: 2, label: "Tuesday" },
  { n: 3, label: "Wednesday" },
];

function chipClass(active: boolean) {
  return cx(
    "cursor-pointer px-5.5 py-4.5 min-h-16 rounded-md font-heading font-semibold text-xl text-text",
    active ? "border-2 border-accent bg-accent-100" : "border border-divider bg-transparent"
  );
}

export default function RegularOrderPage() {
  const { products, orders, recurringOrders, createRecurringOrder } = useDough();
  const availableProducts = products.filter((p) => p.available);

  const [freq, setFreq] = useState<RecurringFrequency>("every-other");
  const [weekOfMonth, setWeekOfMonth] = useState(1);
  const [weekday, setWeekday] = useState(3);
  const [qty, setQty] = useState<Record<string, number>>({ classic: 2 });
  const [saved, setSaved] = useState(false);

  const items: OrderItem[] = availableProducts
    .map((p) => ({ productId: p.id, quantity: qty[p.id] ?? 0 }))
    .filter((i) => i.quantity > 0);

  const bump = (id: string, delta: number) =>
    setQty((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) + delta) }));

  const freqInfo = FREQUENCIES.find((f) => f.id === freq)!;
  const dayName = DAYS.find((d) => d.n === weekday)!.label;
  const weekLabel = WEEKS.find((w) => w.n === weekOfMonth)!.label;

  const nextDate =
    freq === "monthly"
      ? nextMonthlyDate(weekday, weekOfMonth)
      : nextDateForWeekday(weekday);

  const recSummary = items.length
    ? items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId);
          return `${i.quantity} × ${product?.name ?? "item"}`;
        })
        .join(" + ")
    : "Nothing chosen yet";

  const recCadence =
    freq === "monthly"
      ? `Monthly, on the ${weekLabel} ${dayName}`
      : `${freqInfo.cadence}${dayName}`;

  const total = itemsTotal(items, products);
  const firstPickupFits =
    items.length > 0 &&
    canFulfillOnDate(items, toISODate(nextDate), products, orders, recurringOrders);
  const canSave = items.length > 0 && firstPickupFits;

  function handleSave() {
    if (!canSave) return;
    createRecurringOrder({
      customerName: mockCustomer.name,
      phone: mockCustomer.phone,
      items,
      frequency: freq,
      weekday,
      weekOfMonth: freq === "monthly" ? weekOfMonth : undefined,
      nextPickupDateId: toISODate(nextDate),
    });
    setSaved(true);
  }

  if (saved) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center gap-6 max-w-[640px] mx-auto">
        <h1 className="text-[44px] font-normal m-0">Your regular order is set.</h1>
        <p className="text-xl m-0">
          {recSummary} — {recCadence.toLowerCase()}. First pickup{" "}
          {formatLongDate(nextDate)}.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/my-orders">
            <Button size="lg">VIEW MY ORDERS</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="lg">
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-[880px] mx-auto px-6 py-14">
        <h1 className="text-[36px] sm:text-[54px] font-normal m-0 mb-3">
          Want bread on the regular?
        </h1>
        <p className="text-xl m-0 mb-12">
          Tell us how often and we&apos;ll bake it for you. Skip, change, or
          stop anytime — no phone call needed.
        </p>

        <h2 className="text-[34px] font-semibold m-0 mb-5">How often?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {FREQUENCIES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFreq(f.id)}
              className={chipClass(freq === f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {freq === "monthly" && (
          <>
            <h2 className="text-[34px] font-semibold m-0 mb-5">
              Which week of the month?
            </h2>
            <div className="flex gap-4 flex-wrap mb-12">
              {WEEKS.map((w) => (
                <button
                  key={w.n}
                  type="button"
                  onClick={() => setWeekOfMonth(w.n)}
                  className={chipClass(weekOfMonth === w.n)}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </>
        )}

        <h2 className="text-[34px] font-semibold m-0 mb-5">
          Which day works best?
        </h2>
        <div className="flex gap-4 flex-wrap mb-12">
          {DAYS.map((d) => (
            <button
              key={d.n}
              type="button"
              onClick={() => setWeekday(d.n)}
              className={chipClass(weekday === d.n)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <h2 className="text-[34px] font-semibold m-0 mb-5">How much bread?</h2>
        <div className="flex flex-col gap-4.5 mb-12">
          {availableProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-5 flex-wrap p-5 border border-divider rounded-md bg-neutral-100"
            >
              <div>
                <div className="font-heading text-[26px] font-semibold">
                  {p.name}
                </div>
                <div className="text-lg text-neutral-700">
                  ${p.price} / {p.unit}
                </div>
              </div>
              <QuantityStepper
                quantity={qty[p.id] ?? 0}
                onIncrement={() => bump(p.id, 1)}
                onDecrement={() => bump(p.id, -1)}
                label={p.name}
              />
            </div>
          ))}
        </div>

        <div className="p-8 border border-accent bg-accent-100 rounded-md">
          <div className="text-[17px] tracking-[0.08em] uppercase text-accent-800 mb-4">
            Your bread schedule
          </div>
          <div className="font-heading text-[34px] font-semibold leading-tight">
            {recSummary}
          </div>
          <div className="text-xl mt-3">{recCadence}</div>
          <div className="text-xl mt-1.5">
            Next pickup: {formatLongDate(nextDate)}
          </div>
          <div className="text-xl mt-1.5">
            ${total} {freqInfo.per}, paid in cash at each pickup.
          </div>
          {items.length > 0 && !firstPickupFits && (
            <div className="text-xl mt-3 font-semibold text-accent-800">
              That&apos;s more than what&apos;s left for {formatLongDate(nextDate)}.
              Try a smaller quantity or a different day.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-9">
          <Button size="lg" onClick={handleSave} disabled={!canSave}>
            START MY REGULAR ORDER
          </Button>
          <Link href="/order">
            <Button variant="secondary">Just order once instead</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
