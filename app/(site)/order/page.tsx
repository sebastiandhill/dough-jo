"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDough } from "@/lib/store";
import { bakerySettings } from "@/lib/mock-data/settings";
import { canFulfillOnDate } from "@/lib/dates";
import { itemsCount, itemsTotal, formatMoney } from "@/lib/utils";
import type { OrderItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/components/orders/StepIndicator";
import { DateCard } from "@/components/orders/DateCard";
import { OrderProductRow } from "@/components/products/OrderProductRow";

const STEPS = ["Bread", "Day", "Details"];

export default function OrderPage() {
  const router = useRouter();
  const { products, orders, recurringOrders, getAvailablePickupDates, createOrder } =
    useDough();
  const availableProducts = products.filter((p) => p.available);
  const rawDates = useMemo(
    () => getAvailablePickupDates(8),
    [getAvailablePickupDates]
  );

  const [step, setStep] = useState(1);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [dateId, setDateId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const items: OrderItem[] = useMemo(
    () =>
      availableProducts
        .map((p) => ({ productId: p.id, quantity: qty[p.id] ?? 0 }))
        .filter((i) => i.quantity > 0),
    // availableProducts is derived fresh from `products` each render; its
    // contents (not identity) are what matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, qty]
  );

  // A date only counts as a real option if THIS cart's quantities actually
  // fit what's left after recurring reservations — not just the aggregate
  // headline number. This is what stops a one-time order from taking a
  // regular's reserved loaf.
  const dates = useMemo(
    () =>
      rawDates
        .map((d) => ({
          ...d,
          fits: canFulfillOnDate(items, d.id, products, orders, recurringOrders),
        }))
        .filter((d) => d.fits || d.id === dateId)
        .slice(0, 4),
    [rawDates, items, products, orders, recurringOrders, dateId]
  );

  const orderCount = itemsCount(items);
  const total = itemsTotal(items, products);
  const selectedDate = dates.find((d) => d.id === dateId) ?? null;
  const selectedDateFits = selectedDate?.fits ?? false;

  const bump = (id: string, delta: number) =>
    setQty((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) + delta) }));

  const blocked =
    (step === 1 && orderCount === 0) ||
    (step === 2 && (!selectedDate || !selectedDateFits)) ||
    (step === 3 && (!name.trim() || !phone.trim()));

  const nextLabel = step === 1 ? "PICK A DAY" : step === 2 ? "CONTINUE" : "PLACE ORDER";

  function handleBack() {
    if (step === 1) router.push("/");
    else setStep((s) => s - 1);
  }

  function handleNext() {
    if (blocked) return;
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    const order = createOrder({
      customerName: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      items,
      pickupDateId: selectedDate!.id,
    });
    router.push(`/order/confirmation?orderId=${order.id}`);
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-[880px] mx-auto w-full px-6 pt-11 pb-10 flex-1">
        <StepIndicator steps={STEPS} current={step} />

        {step === 1 && (
          <div>
            <h1 className="text-[36px] sm:text-[48px] font-normal m-0 mb-2.5">
              What would you like?
            </h1>
            <p className="text-[19px] m-0 mb-9">
              Everything is baked fresh on your pickup day.
            </p>
            <div className="flex flex-col gap-6">
              {availableProducts.map((product) => (
                <OrderProductRow
                  key={product.id}
                  product={product}
                  quantity={qty[product.id] ?? 0}
                  onIncrement={() => bump(product.id, 1)}
                  onDecrement={() => bump(product.id, -1)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-[36px] sm:text-[48px] font-normal m-0 mb-2.5">
              When would you like your bread?
            </h1>
            <p className="text-[19px] m-0 mb-9">
              These are the days with room left. Pickup is{" "}
              {bakerySettings.pickupWindow} in {bakerySettings.location}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {dates.map((d) => (
                <DateCard
                  key={d.id}
                  date={d}
                  selected={d.id === dateId}
                  fits={d.fits}
                  onSelect={() => setDateId(d.id)}
                />
              ))}
            </div>
            {selectedDate && (
              <div className="mt-8 p-6.5 border border-accent rounded-md bg-accent-100">
                <div className="font-heading text-[27px] font-semibold">
                  Pickup: {selectedDate.long}
                </div>
                <div className="text-[19px] mt-2">
                  Pickup window: {bakerySettings.pickupWindow} ·{" "}
                  {bakerySettings.location}
                </div>
                <div className="text-[19px] mt-2">
                  We&apos;ll text you the address and let you know when your
                  bread is ready.
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-[36px] sm:text-[48px] font-normal m-0 mb-2.5">
              Almost done.
            </h1>
            <p className="text-[19px] m-0 mb-9">
              You pay in cash when you pick up. Nothing to enter but your
              name and number.
            </p>
            <div className="flex flex-col gap-6 max-w-[520px]">
              <label className="block">
                <span className="block text-lg mb-2">Your name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full min-h-[60px] font-body text-xl px-4 py-3 bg-transparent border border-neutral-500 rounded-md text-text"
                />
              </label>
              <label className="block">
                <span className="block text-lg mb-2">
                  Mobile number — for your bread-is-ready text
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full min-h-[60px] font-body text-xl px-4 py-3 bg-transparent border border-neutral-500 rounded-md text-text"
                />
              </label>
              <label className="block">
                <span className="block text-lg mb-2">Email (optional)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[60px] font-body text-xl px-4 py-3 bg-transparent border border-neutral-500 rounded-md text-text"
                />
              </label>
            </div>
            <p className="mt-7 mb-0 text-lg text-neutral-700">
              No account needed. We keep your number for order texts only.
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-neutral-100 border-t border-divider shadow-[var(--shadow-md)]">
        <div className="max-w-[880px] mx-auto px-6 py-4.5 flex flex-wrap gap-4.5 items-center justify-between">
          <div>
            <div className="font-heading text-2xl tabular-nums">
              {orderCount === 0
                ? "Nothing added yet"
                : `${orderCount} ${orderCount === 1 ? "item" : "items"} · ${formatMoney(total)}`}
            </div>
            <div className="text-[17px] text-neutral-700">
              {selectedDate ? `Pickup ${selectedDate.long}, ${bakerySettings.pickupWindow}` : "Cash at pickup"}
            </div>
          </div>
          <div className="flex gap-3.5 items-center">
            <Button variant="secondary" size="sm" onClick={handleBack}>
              {step === 1 ? "Back to home" : "Back"}
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              disabled={blocked || submitting}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
