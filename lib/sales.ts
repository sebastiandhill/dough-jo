import type { Order, Product } from "@/lib/types";
import { findProduct } from "@/lib/utils";

export interface SalesRecord {
  date: Date;
  productId: string;
  quantity: number;
  money: number;
}

/** Converts real placed orders into per-item sales records, keyed by pickup
 * date, for the admin Totals tab. Priced at each item's CURRENT product
 * price; orders referencing a since-deleted product are skipped. */
export function ordersToSalesRecords(
  orders: Order[],
  products: Product[]
): SalesRecord[] {
  const out: SalesRecord[] = [];
  orders.forEach((order) => {
    const date = new Date(`${order.pickupDateId}T12:00:00`);
    order.items.forEach((item) => {
      const product = findProduct(products, item.productId);
      if (!product) return;
      out.push({
        date,
        productId: item.productId,
        quantity: item.quantity,
        money: item.quantity * product.price,
      });
    });
  });
  return out;
}
