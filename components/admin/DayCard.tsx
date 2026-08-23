import type { Order, OrderStatus, Product } from "@/lib/types";
import { formatWeekday, formatShortDate } from "@/lib/dates";
import { OrderRow } from "@/components/admin/OrderRow";

export function DayCard({
  date,
  orders,
  products,
  onAdvance,
}: {
  date: Date;
  orders: Order[];
  products: Product[];
  onAdvance: (orderId: string, status: OrderStatus) => void;
}) {
  const counts: Record<string, number> = {};
  orders.forEach((o) =>
    o.items.forEach((i) => {
      counts[i.productId] = (counts[i.productId] ?? 0) + i.quantity;
    })
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeProducts = products.filter((p) => counts[p.id]);

  return (
    <section className="border border-divider rounded-md bg-neutral-100 overflow-hidden">
      <div className="p-6 sm:p-7 flex flex-wrap gap-4.5 items-baseline justify-between border-b border-divider">
        <div>
          <div className="font-heading text-[32px] font-semibold">
            {formatWeekday(date)} — {formatShortDate(date)}
          </div>
          <div className="text-lg text-neutral-700 tabular-nums">
            {orders.length} {orders.length === 1 ? "order" : "orders"} ·
            pickup 3:00 – 6:00 PM
          </div>
        </div>
        <div className="font-heading text-[30px] tabular-nums">
          {total} {total === 1 ? "item" : "items"}
        </div>
      </div>

      {activeProducts.length > 0 && (
        <div className="px-6 sm:px-7 py-5 flex flex-col gap-3.5 border-b border-divider">
          {activeProducts.map((p) => {
            const pct = Math.min(100, (counts[p.id] / Math.max(1, p.maxPerBakeDay)) * 100);
            return (
              <div
                key={p.id}
                className="grid grid-cols-[minmax(0,1fr)_96px_190px] gap-4 items-center"
              >
                <div className="text-lg">{p.name}</div>
                <div className="font-heading text-xl tabular-nums text-right">
                  {counts[p.id]} / {p.maxPerBakeDay}
                </div>
                <div className="h-2.5 bg-neutral-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-6 sm:px-7 py-5">
        <div className="text-[16px] tracking-[0.1em] uppercase text-neutral-700 mb-3">
          Orders
        </div>
        {orders.length === 0 && (
          <p className="text-lg text-neutral-700 m-0">No orders yet.</p>
        )}
        {orders.map((o) => (
          <OrderRow
            key={o.id}
            order={o}
            products={products}
            onAdvance={(status) => onAdvance(o.id, status)}
          />
        ))}
      </div>
    </section>
  );
}
