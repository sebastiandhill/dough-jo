"use client";

import Link from "next/link";
import { useDough } from "@/lib/store";
import { getPickupDateById } from "@/lib/dates";
import { describeItems, itemsTotal } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RecurringOrderCard } from "@/components/orders/RecurringOrderCard";

const STATUS_LABEL: Record<string, string> = {
  received: "Received",
  baking: "Baking",
  ready: "Ready for pickup",
  "picked-up": "Picked up",
};

export default function MyOrdersPage() {
  const { getCustomerOrders, products } = useDough();
  const { orders, recurringOrders } = getCustomerOrders();

  const upcoming = orders
    .filter((o) => o.status !== "picked-up")
    .sort((a, b) => a.pickupDateId.localeCompare(b.pickupDateId));

  const hasNothing = upcoming.length === 0 && recurringOrders.length === 0;

  return (
    <main className="flex-1">
      <div className="max-w-[880px] mx-auto px-6 py-14">
        <h1 className="text-[36px] sm:text-[48px] font-normal m-0 mb-2.5">
          My orders
        </h1>
        <p className="text-[19px] m-0 mb-11">
          Showing orders for {orders[0]?.customerName ?? "you"}.
        </p>

        {hasNothing && (
          <div className="p-8 border border-divider rounded-md bg-neutral-100 text-center flex flex-col gap-5 items-center">
            <p className="text-xl m-0">You don&apos;t have any orders yet.</p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/order">
                <Button>ORDER BREAD</Button>
              </Link>
              <Link href="/regular-order">
                <Button variant="secondary">SET UP A REGULAR ORDER</Button>
              </Link>
            </div>
          </div>
        )}

        {recurringOrders.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[28px] font-semibold m-0 mb-5">
              Your regular order
            </h2>
            <div className="flex flex-col gap-5">
              {recurringOrders.map((r) => (
                <RecurringOrderCard key={r.id} order={r} products={products} />
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 className="text-[28px] font-semibold m-0 mb-5">
              Upcoming pickups
            </h2>
            <div className="flex flex-col gap-4">
              {upcoming.map((order) => {
                const pickup = getPickupDateById(order.pickupDateId);
                return (
                  <div
                    key={order.id}
                    className="border border-divider rounded-md bg-neutral-100 p-6 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-heading text-2xl font-semibold">
                        {describeItems(order.items, products)}
                      </div>
                      <div className="text-lg text-neutral-700 mt-1">
                        {pickup ? pickup.long : order.pickupDateId} · $
                        {itemsTotal(order.items, products)} cash at pickup
                      </div>
                    </div>
                    <Badge tone={order.status === "ready" ? "accent" : "neutral"}>
                      {STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
