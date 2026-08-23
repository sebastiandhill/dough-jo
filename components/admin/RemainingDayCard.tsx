import type { Order, Product } from "@/lib/types";
import { formatLongDate } from "@/lib/dates";

export function RemainingDayCard({
  date,
  orders,
  products,
}: {
  date: Date;
  orders: Order[];
  products: Product[];
}) {
  const counts: Record<string, number> = {};
  orders.forEach((o) =>
    o.items.forEach((i) => {
      counts[i.productId] = (counts[i.productId] ?? 0) + i.quantity;
    })
  );

  const rows = products
    .filter((p) => p.available)
    .map((p) => {
      const left = Math.max(0, p.maxPerBakeDay - (counts[p.id] ?? 0));
      return { product: p, left };
    });
  const remainingCount = rows.filter((r) => r.left > 0).length;

  return (
    <section className="border border-divider rounded-md bg-neutral-100 p-6 sm:p-7">
      <div className="flex flex-wrap gap-4 items-baseline justify-between mb-5">
        <div className="font-heading text-[30px] font-semibold">
          {formatLongDate(date)}
        </div>
        <div className="text-lg tabular-nums text-neutral-700">
          {remainingCount} of {rows.length} items still available
        </div>
      </div>
      <div className="flex flex-col gap-3.5">
        {rows.map(({ product, left }) => {
          const pct = Math.min(100, (left / Math.max(1, product.maxPerBakeDay)) * 100);
          return (
            <div
              key={product.id}
              className="grid grid-cols-[minmax(0,1fr)_210px_130px] gap-4.5 items-center pt-3 border-t border-divider"
            >
              <div className="text-lg">{product.name}</div>
              <div className="h-3 bg-neutral-300 rounded-full overflow-hidden">
                <div
                  className={left === 0 ? "h-full bg-neutral-500 rounded-full" : "h-full bg-accent rounded-full"}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className={
                  "font-heading text-xl tabular-nums text-right " +
                  (left === 0
                    ? "text-neutral-700"
                    : left <= 2
                    ? "text-accent-800"
                    : "text-text")
                }
              >
                {left === 0 ? "Sold out" : `${left} left`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
