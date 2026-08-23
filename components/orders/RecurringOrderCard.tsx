"use client";

import { useState } from "react";
import type { Product, RecurringOrder } from "@/lib/types";
import {
  formatLongDate,
  advanceRecurringDate,
  nextDateForWeekday,
  nextMonthlyDate,
  toISODate,
} from "@/lib/dates";
import { describeItems, itemsTotal, cx } from "@/lib/utils";
import { useDough } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

const DAY_LABEL: Record<number, string> = { 2: "Tuesday", 3: "Wednesday" };
const FREQ_LABEL: Record<string, string> = {
  weekly: "Every week",
  "every-other": "Every other week",
  monthly: "Every month",
};

export function RecurringOrderCard({
  order,
  products,
}: {
  order: RecurringOrder;
  products: Product[];
}) {
  const { updateRecurringOrder } = useDough();
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(order.items.map((i) => [i.productId, i.quantity]))
  );
  const [weekday, setWeekday] = useState(order.weekday);

  const total = itemsTotal(order.items, products);
  const nextDate = new Date(`${order.nextPickupDateId}T12:00:00`);

  const badgeTone =
    order.status === "active"
      ? "accent"
      : order.status === "paused"
      ? "outline"
      : "neutral";
  const badgeLabel =
    order.status === "active"
      ? "Active"
      : order.status === "paused"
      ? "Paused"
      : "Cancelled";

  function handleSkip() {
    const next = advanceRecurringDate(
      order.nextPickupDateId,
      order.frequency,
      order.weekday,
      order.weekOfMonth
    );
    updateRecurringOrder(order.id, {
      skipDateId: order.nextPickupDateId,
      nextPickupDateId: toISODate(next),
    });
  }

  function handleSaveEdit() {
    const items = Object.entries(qty)
      .map(([productId, quantity]) => ({ productId, quantity }))
      .filter((i) => i.quantity > 0);
    const nextPickupDateId =
      weekday === order.weekday
        ? order.nextPickupDateId
        : toISODate(
            order.frequency === "monthly"
              ? nextMonthlyDate(weekday, order.weekOfMonth ?? 1)
              : nextDateForWeekday(weekday)
          );
    updateRecurringOrder(order.id, { items, weekday, nextPickupDateId });
    setEditing(false);
  }

  const bump = (id: string, delta: number) =>
    setQty((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) + delta) }));

  return (
    <div className="border border-divider rounded-md bg-neutral-100 p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[16px] tracking-[0.08em] uppercase text-neutral-700 mb-1.5">
            {FREQ_LABEL[order.frequency]} · {DAY_LABEL[order.weekday]}
          </div>
          <div className="font-heading text-2xl font-semibold">
            {describeItems(order.items, products)}
          </div>
          <div className="text-lg text-neutral-700 mt-1">
            ${total} per pickup, cash at pickup
          </div>
        </div>
        <Badge tone={badgeTone}>{badgeLabel}</Badge>
      </div>

      {order.status !== "cancelled" && (
        <div className="text-lg">
          Next pickup:{" "}
          <span className="font-heading font-semibold">
            {formatLongDate(nextDate)}
          </span>
        </div>
      )}

      {editing ? (
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <div className="flex flex-col gap-3">
            {products
              .filter((p) => p.available)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 flex-wrap"
                >
                  <span className="text-lg">{p.name}</span>
                  <QuantityStepper
                    size="md"
                    quantity={qty[p.id] ?? 0}
                    onIncrement={() => bump(p.id, 1)}
                    onDecrement={() => bump(p.id, -1)}
                    label={p.name}
                  />
                </div>
              ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(DAY_LABEL).map(([n, label]) => (
              <button
                key={n}
                type="button"
                onClick={() => setWeekday(Number(n))}
                className={cx(
                  "px-4 py-2.5 rounded-md font-heading text-lg",
                  weekday === Number(n)
                    ? "border-2 border-accent bg-accent-100"
                    : "border border-divider"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={handleSaveEdit}>
              Save changes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        order.status !== "cancelled" && (
          <div className="flex flex-wrap gap-3 border-t border-divider pt-5">
            {order.status === "active" ? (
              <>
                <Button size="sm" variant="secondary" onClick={handleSkip}>
                  Skip next pickup
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                  Change quantity or day
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateRecurringOrder(order.id, { status: "paused" })}
                >
                  Pause
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => updateRecurringOrder(order.id, { status: "active" })}
              >
                Resume
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateRecurringOrder(order.id, { status: "cancelled" })}
            >
              Cancel this schedule
            </Button>
          </div>
        )
      )}
    </div>
  );
}
