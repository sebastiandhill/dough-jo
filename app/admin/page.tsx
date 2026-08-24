"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDough } from "@/lib/store";
import {
  bakeDatesForWeek,
  toISODate,
  formatShortDate,
  weekStartForOffset,
  addDays,
} from "@/lib/dates";
import { bakerySettings } from "@/lib/mock-data/settings";
import { cx } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DayCard } from "@/components/admin/DayCard";
import { ProductRow } from "@/components/admin/ProductRow";
import { AddProductForm } from "@/components/admin/AddProductForm";
import { RemainingDayCard } from "@/components/admin/RemainingDayCard";
import { TotalsPanel } from "@/components/admin/TotalsPanel";

type Tab = "baking" | "products" | "capacity" | "totals";

const TABS: { id: Tab; label: string }[] = [
  { id: "baking", label: "Baking" },
  { id: "products", label: "Products" },
  { id: "capacity", label: "Remaining" },
  { id: "totals", label: "Totals" },
];

function weekLabel(week: number) {
  if (week === 0) return "This week";
  if (week === 1) return "Next week";
  if (week === -1) return "Last week";
  const start = weekStartForOffset(week);
  const end = addDays(start, 6);
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export default function AdminPage() {
  const {
    products,
    getAdminOrders,
    updateOrderStatus,
    toggleProductAvailability,
    updateProductCap,
    addProduct,
    deleteProduct,
    ensureRecurringOccurrences,
  } = useDough();

  const [tab, setTab] = useState<Tab>("baking");
  const [week, setWeek] = useState(0);
  const [adding, setAdding] = useState(false);

  const orders = getAdminOrders();
  const dates = useMemo(() => bakeDatesForWeek(week), [week]);
  const dateIds = useMemo(() => dates.map((d) => toISODate(d)), [dates]);

  // Every active recurring order gets a real, trackable order on each of its
  // projected pickup dates — not just the one it was created for — so the
  // baker always sees the full picture for whatever week they're viewing.
  useEffect(() => {
    ensureRecurringOccurrences(dateIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateIds.join(",")]);

  const weekOrders = orders.filter((o) =>
    dates.some((d) => toISODate(d) === o.pickupDateId)
  );
  const weekTotal = weekOrders.reduce(
    (t, o) => t + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const attention = weekOrders.filter((o) => o.status === "ready").length;

  const showWeekBar = tab === "baking" || tab === "capacity";

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-20 bg-header border-b border-divider">
        <div className="max-w-[1180px] mx-auto px-6 py-3.5 flex items-center gap-5 flex-wrap">
          <Image
            src="/images/dough-jo-logo.png"
            alt="Dough Jo"
            width={68}
            height={68}
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-heading text-[27px] tracking-[-0.01em] whitespace-nowrap">
              Dough Jo
            </span>
            <span className="text-[15px] tracking-[0.12em] uppercase text-neutral-700 whitespace-nowrap">
              Baker Dashboard
            </span>
          </span>
          <Link href="/" className="ml-auto text-lg whitespace-nowrap">
            View the website
          </Link>
        </div>

        <nav className="max-w-[1180px] mx-auto px-6 flex gap-0 border-t border-divider overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cx(
                "px-5 py-3.5 min-h-13 bg-transparent cursor-pointer text-lg whitespace-nowrap border-b-2",
                tab === t.id
                  ? "border-accent text-accent-800"
                  : "border-transparent"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {showWeekBar && (
          <div className="max-w-[1180px] mx-auto px-6 py-3 flex items-center gap-3.5 flex-wrap border-t border-divider bg-neutral-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWeek((w) => w - 1)}
            >
              ← Previous week
            </Button>
            <div className="min-w-[230px] text-center">
              <div className="font-heading text-xl font-semibold whitespace-nowrap">
                {weekLabel(week)}
              </div>
              <div className="text-lg text-neutral-700 tabular-nums">
                {formatShortDate(dates[0])} – {formatShortDate(dates[1])}
                {week === 0 ? " · this week" : ""}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWeek((w) => w + 1)}
            >
              Next week →
            </Button>
            <Button size="sm" onClick={() => setWeek(0)} disabled={week === 0}>
              Jump to this week
            </Button>
          </div>
        )}
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-11 pb-20">
        {tab === "baking" && (
          <div>
            <h1 className="text-[44px] sm:text-[52px] font-normal m-0 mb-1.5">
              {week === 0
                ? "This week's baking"
                : week === 1
                ? "Next week's baking"
                : week === -1
                ? "Last week's baking"
                : `Baking, week of ${formatShortDate(weekStartForOffset(week))}`}
            </h1>
            <p className="text-[19px] m-0 mb-11">
              {formatShortDate(dates[0])} – {formatShortDate(dates[1])} ·
              Pickup {bakerySettings.pickupWindow}
            </p>

            {weekOrders.length === 0 && (
              <p className="m-0 mb-11 px-6.5 py-5.5 border border-divider rounded-md bg-neutral-100 text-xl">
                No orders for this week yet. Capacity is wide open.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mb-14">
              <div className="border-t-2 border-accent pt-4.5">
                <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
                  {dates[0] > new Date() ? "Next bake" : "First bake day"}
                </div>
                <div className="font-heading text-[34px] mt-2">
                  {formatShortDate(dates[0])}
                </div>
                <div className="text-lg tabular-nums">
                  {weekOrders.filter((o) => o.pickupDateId === toISODate(dates[0])).length} orders
                </div>
              </div>
              <div className="border-t border-divider pt-4.5">
                <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
                  Items this week
                </div>
                <div className="font-heading text-[34px] mt-2 tabular-nums">
                  {weekTotal}
                </div>
                <div className="text-lg tabular-nums">
                  {weekOrders.length} customers
                </div>
              </div>
              <div className="border-t border-divider pt-4.5">
                <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
                  Needs attention
                </div>
                <div className="font-heading text-[34px] mt-2 tabular-nums">
                  {attention}
                </div>
                <div className="text-lg">
                  {attention ? "waiting for pickup" : "nothing waiting"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {dates.map((date) => (
                <DayCard
                  key={toISODate(date)}
                  date={date}
                  orders={weekOrders.filter(
                    (o) => o.pickupDateId === toISODate(date)
                  )}
                  products={products}
                  onAdvance={updateOrderStatus}
                />
              ))}
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <h1 className="text-[44px] sm:text-[52px] font-normal m-0 mb-1.5">
              Products
            </h1>
            <p className="text-[19px] m-0 mb-7">
              Turn something off and it disappears from the website. Prices
              update everywhere.
            </p>

            {!adding && (
              <Button className="mb-9" onClick={() => setAdding(true)}>
                + ADD A PRODUCT
              </Button>
            )}

            {adding && (
              <AddProductForm
                onCancel={() => setAdding(false)}
                onSave={(input) => {
                  addProduct(input);
                  setAdding(false);
                }}
              />
            )}

            <div className="flex flex-col gap-5">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onCapChange={(cap) => updateProductCap(p.id, cap)}
                  onToggle={() => toggleProductAvailability(p.id)}
                  onDelete={() => {
                    if (
                      window.confirm(
                        `Delete "${p.name}"? This can't be undone, and it will disappear from the website immediately.`
                      )
                    ) {
                      deleteProduct(p.id);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {tab === "capacity" && (
          <div>
            <h1 className="text-[44px] sm:text-[52px] font-normal m-0 mb-1.5">
              {week === 0 ? "Remaining this week" : `Remaining, week of ${formatShortDate(weekStartForOffset(week))}`}
            </h1>
            <p className="text-[19px] m-0 mb-11">
              What&apos;s left for customers to order. When something hits
              zero it stops showing up on the website.
            </p>

            <div className="flex flex-col gap-8 mb-14">
              {dates.map((date) => (
                <RemainingDayCard
                  key={toISODate(date)}
                  date={date}
                  orders={weekOrders.filter(
                    (o) => o.pickupDateId === toISODate(date)
                  )}
                  products={products}
                />
              ))}
            </div>

            <h2 className="text-[38px] font-normal m-0 mb-6">Bakery rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
              <div className="border-t border-divider pt-4.5">
                <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
                  Baking days
                </div>
                <div className="font-heading text-2xl mt-2">
                  Tuesday · Wednesday
                </div>
              </div>
              <div className="border-t border-divider pt-4.5">
                <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
                  Order lead time
                </div>
                <div className="font-heading text-2xl mt-2 tabular-nums">
                  {bakerySettings.leadTimeDays} days
                </div>
              </div>
              <div className="border-t border-divider pt-4.5">
                <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
                  Pickup window
                </div>
                <div className="font-heading text-2xl mt-2 tabular-nums">
                  {bakerySettings.pickupWindow}
                </div>
              </div>
            </div>
            <p className="mt-8 mb-0 px-6 py-5 bg-accent-100 border-l-[3px] border-accent text-[19px]">
              Recurring orders are counted before anything is offered to
              one-time customers, so a regular never loses their loaf.
            </p>
          </div>
        )}

        {tab === "totals" && <TotalsPanel products={products} orders={orders} />}
      </main>
    </div>
  );
}
