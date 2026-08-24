"use client";

import { useMemo, useState } from "react";
import type { Order, Product } from "@/lib/types";
import { ordersToSalesRecords } from "@/lib/sales";
import { cx } from "@/lib/utils";

type Range = "month" | "lastMonth" | "quarter" | "year" | "custom";

const RANGE_OPTIONS: { id: Range; label: string }[] = [
  { id: "month", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "quarter", label: "Last 3 months" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom dates" },
];

function formatD(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function rangeBounds(range: Range, from: string, to: string) {
  const today = new Date();
  today.setHours(23, 59, 59, 0);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (range === "month") {
    // Spans the whole current month — not just up to today — so upcoming
    // booked orders later this month show up alongside what's already sold.
    const a = new Date(today.getFullYear(), today.getMonth(), 1);
    const b = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    return { from: a, to: b };
  }
  if (range === "lastMonth") {
    const a = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const b = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
    return { from: a, to: b };
  }
  if (range === "quarter") {
    start.setMonth(start.getMonth() - 3);
    return { from: start, to: today };
  }
  if (range === "year") {
    // Same reasoning as "month": the full year, including upcoming bookings.
    const a = new Date(today.getFullYear(), 0, 1);
    const b = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
    return { from: a, to: b };
  }
  const a = from ? new Date(`${from}T00:00:00`) : new Date(today.getFullYear(), today.getMonth(), 1);
  const b = to ? new Date(`${to}T23:59:59`) : today;
  return { from: a, to: b };
}

function pillClass(active: boolean) {
  return cx(
    "min-h-13 px-5 py-3 text-lg whitespace-nowrap rounded-md",
    active
      ? "border-2 border-accent bg-accent-100 text-accent-800"
      : "border border-divider"
  );
}

export function TotalsPanel({
  products,
  orders,
}: {
  products: Product[];
  orders: Order[];
}) {
  const [range, setRange] = useState<Range>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  const bounds = useMemo(() => rangeBounds(range, from, to), [range, from, to]);
  // Totals are driven entirely by real placed orders — no simulated backdrop.
  const allSales = useMemo(
    () => ordersToSalesRecords(orders, products),
    [orders, products]
  );

  const rows = useMemo(
    () =>
      allSales.filter(
        (r) =>
          r.date >= bounds.from &&
          r.date <= bounds.to &&
          (filterProduct === "all" || r.productId === filterProduct)
      ),
    [allSales, bounds, filterProduct]
  );

  const totalItems = rows.reduce((t, r) => t + r.quantity, 0);
  const totalMoney = rows.reduce((t, r) => t + r.money, 0);
  const dayKeys = new Set(rows.map((r) => r.date.toISOString().slice(0, 10)));

  const byProduct = products
    .map((p) => {
      const mine = rows.filter((r) => r.productId === p.id);
      const qty = mine.reduce((t, r) => t + r.quantity, 0);
      return {
        product: p,
        qty,
        money: mine.reduce((t, r) => t + r.money, 0),
        share: totalItems ? Math.round((qty / totalItems) * 100) : 0,
      };
    })
    .filter((r) => r.qty > 0)
    .sort((a, b) => b.qty - a.qty);

  const filterLabel =
    filterProduct === "all"
      ? "all products"
      : products.find((p) => p.id === filterProduct)?.name ?? "";

  return (
    <div>
      <h1 className="text-[44px] sm:text-[52px] font-normal m-0 mb-1.5">Totals</h1>
      <p className="text-[19px] m-0 mb-9">
        {formatD(bounds.from)} – {formatD(bounds.to)} · {filterLabel}
      </p>

      <div className="flex flex-wrap gap-3 mb-5">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={pillClass(range === r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {range === "custom" && (
        <div className="flex flex-wrap gap-6 items-end p-6 border border-divider rounded-md bg-neutral-100 mb-5">
          <label className="block">
            <span className="block text-lg mb-2">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="min-h-14 text-xl px-4 py-3 border border-divider rounded-md bg-transparent tabular-nums"
            />
          </label>
          <label className="block">
            <span className="block text-lg mb-2">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="min-h-14 text-xl px-4 py-3 border border-divider rounded-md bg-transparent tabular-nums"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center mb-11">
        <span className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
          Product
        </span>
        <button
          type="button"
          onClick={() => setFilterProduct("all")}
          className={pillClass(filterProduct === "all")}
        >
          All products
        </button>
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilterProduct(p.id)}
            className={pillClass(filterProduct === p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mb-14">
        <div className="border-t-2 border-accent pt-4.5">
          <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
            Total sold
          </div>
          <div className="font-heading text-[46px] mt-2 tabular-nums">
            {totalItems.toLocaleString("en-US")}
          </div>
          <div className="text-lg text-neutral-700">items</div>
        </div>
        <div className="border-t border-divider pt-4.5">
          <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
            Money taken in
          </div>
          <div className="font-heading text-[46px] mt-2 tabular-nums">
            ${totalMoney.toLocaleString("en-US")}
          </div>
          <div className="text-lg text-neutral-700">cash at pickup</div>
        </div>
        <div className="border-t border-divider pt-4.5">
          <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700">
            Bake days
          </div>
          <div className="font-heading text-[46px] mt-2 tabular-nums">
            {dayKeys.size}
          </div>
          <div className="text-lg text-neutral-700">
            {dayKeys.size ? `${Math.round(totalItems / dayKeys.size)} items per bake day` : "no bakes"}
          </div>
        </div>
      </div>

      <h2 className="text-[34px] font-normal m-0 mb-5">By product</h2>
      {byProduct.length === 0 ? (
        <p className="m-0 p-6 border border-divider rounded-md bg-neutral-100 text-xl">
          Nothing sold in this range.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-lg">
            <thead>
              <tr>
                <th className="text-left text-[16px] uppercase tracking-[0.08em] text-neutral-700 border-b border-divider py-3 px-3">
                  Product
                </th>
                <th className="text-right text-[16px] uppercase tracking-[0.08em] text-neutral-700 border-b border-divider py-3 px-3">
                  Sold
                </th>
                <th className="text-right text-[16px] uppercase tracking-[0.08em] text-neutral-700 border-b border-divider py-3 px-3">
                  Share
                </th>
                <th className="text-right text-[16px] uppercase tracking-[0.08em] text-neutral-700 border-b border-divider py-3 px-3">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {byProduct.map((r) => (
                <tr key={r.product.id}>
                  <td className="py-4 px-3 border-b border-divider">{r.product.name}</td>
                  <td className="py-4 px-3 border-b border-divider text-right tabular-nums">
                    {r.qty}
                  </td>
                  <td className="py-4 px-3 border-b border-divider text-right tabular-nums">
                    {r.share}%
                  </td>
                  <td className="py-4 px-3 border-b border-divider text-right tabular-nums">
                    ${r.money.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
