"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDough } from "@/lib/store";
import { getPickupDateById } from "@/lib/dates";
import { formatMoney, itemsTotal } from "@/lib/utils";
import { bakerySettings } from "@/lib/mock-data/settings";
import { Button } from "@/components/ui/Button";

function ConfirmationContent() {
  const orderId = useSearchParams().get("orderId");
  const { orders, products } = useDough();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center gap-6">
        <h1 className="text-4xl font-normal m-0">We couldn&apos;t find that order.</h1>
        <p className="text-lg m-0">It may have already been picked up, or the link is out of date.</p>
        <Link href="/order">
          <Button>ORDER BREAD</Button>
        </Link>
      </main>
    );
  }

  const pickup = getPickupDateById(order.pickupDateId);
  const total = itemsTotal(order.items, products);

  return (
    <main className="flex-1">
      <div className="max-w-[760px] mx-auto px-6 py-16 lg:py-[72px]">
        <h1 className="text-[44px] sm:text-[64px] font-normal m-0 mb-7">
          You&apos;re all set.
        </h1>

        <div className="border-y border-divider py-8 flex flex-col gap-3.5">
          {order.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <div
                key={item.productId}
                className="flex justify-between text-2xl tabular-nums"
              >
                <span>
                  {item.quantity} × {product.name}
                </span>
                <span>{formatMoney(item.quantity * product.price)}</span>
              </div>
            );
          })}
          <div className="flex justify-between font-heading text-[27px] tabular-nums pt-3.5 border-t border-divider">
            <span>Due at pickup, in cash</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        <div className="py-8 flex flex-col gap-2.5 text-xl">
          <div className="text-[17px] tracking-[0.08em] uppercase text-neutral-700">
            Pickup
          </div>
          <div className="font-heading text-[32px]">
            {pickup ? pickup.long : "your selected date"}
          </div>
          <div>
            {bakerySettings.pickupWindow} · {bakerySettings.location}
          </div>
          <div className="mt-3.5">
            We&apos;ll text {order.phone || "your number"} with the pickup
            address, and again when your bread is ready.
          </div>
          <div className="mt-4.5 pt-4.5 border-t border-divider">
            Need anything? Text or call{" "}
            <a
              href={`tel:${bakerySettings.phone.replace(/[^\d+]/g, "")}`}
              className="font-heading text-[26px] tabular-nums whitespace-nowrap"
            >
              {bakerySettings.phone}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/regular-order">
            <Button size="lg">MAKE IT A REGULAR THING</Button>
          </Link>
          <Link href="/order">
            <Button variant="secondary" size="lg">
              ORDER MORE BREAD
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
