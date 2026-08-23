import type { OrderItem, Product } from "@/lib/types";

export function formatMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function findProduct(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function itemsTotal(items: OrderItem[], products: Product[]): number {
  return items.reduce((sum, item) => {
    const product = findProduct(products, item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

export function itemsCount(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function describeItems(items: OrderItem[], products: Product[]): string {
  return items
    .filter((i) => i.quantity > 0)
    .map((i) => {
      const product = findProduct(products, i.productId);
      return `${i.quantity} × ${product ? product.name : "item"}`;
    })
    .join(", ");
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
