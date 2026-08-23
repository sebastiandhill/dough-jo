import { bakeDatesForWeek, toISODate, nextDateForWeekday } from "@/lib/dates";
import type { Order, OrderStatus } from "@/lib/types";
import { mockCustomer } from "@/lib/mock-data/seed-customer";

interface SeedRow {
  week: number; // offset from current week
  day: 0 | 1; // index into bakeDatesForWeek (Tue/Wed)
  customer: string;
  phone: string;
  kind: "one-time" | "recurring";
  items: Record<string, number>;
  status: OrderStatus;
}

const STATUS_BY_INDEX: OrderStatus[] = [
  "received",
  "baking",
  "ready",
  "picked-up",
];

// Mirrors the sample orders from the finished baker-dashboard design, so the
// admin view opens with realistic-looking activity across last/this/next week.
const rows: SeedRow[] = [
  { week: 0, day: 0, customer: "Susan Alderman", phone: "(850) 555-0142", kind: "recurring", items: { classic: 2 }, status: "received" },
  { week: 0, day: 0, customer: "Mike Trahan", phone: "(850) 555-0198", kind: "one-time", items: { classic: 1, pizza: 2 }, status: "baking" },
  { week: 0, day: 0, customer: "Karen Whitfield", phone: "(404) 555-0117", kind: "one-time", items: { inclusion: 2 }, status: "received" },
  { week: 0, day: 0, customer: "Dana Cole", phone: "(850) 555-0163", kind: "recurring", items: { classic: 1, focaccia: 1 }, status: "ready" },
  { week: 0, day: 1, customer: "Robert Nance", phone: "(850) 555-0175", kind: "one-time", items: { classic: 2 }, status: "received" },
  { week: 0, day: 1, customer: "Ellen Pryor", phone: "(205) 555-0131", kind: "recurring", items: { focaccia: 2, pizza: 1 }, status: "received" },
  { week: 0, day: 1, customer: "Tom Bradley", phone: "(850) 555-0109", kind: "one-time", items: { inclusion: 1, classic: 1 }, status: "received" },
  { week: 1, day: 0, customer: "Susan Alderman", phone: "(850) 555-0142", kind: "recurring", items: { classic: 2 }, status: "received" },
  { week: 1, day: 0, customer: "Ellen Pryor", phone: "(205) 555-0131", kind: "recurring", items: { focaccia: 2 }, status: "received" },
  { week: 1, day: 1, customer: "Joan Meriwether", phone: "(850) 555-0188", kind: "one-time", items: { classic: 1, inclusion: 1 }, status: "received" },
  { week: -1, day: 0, customer: "Susan Alderman", phone: "(850) 555-0142", kind: "recurring", items: { classic: 2 }, status: "picked-up" },
  { week: -1, day: 0, customer: "Paul Devane", phone: "(850) 555-0121", kind: "one-time", items: { pizza: 3 }, status: "picked-up" },
  { week: -1, day: 1, customer: "Ellen Pryor", phone: "(205) 555-0131", kind: "recurring", items: { focaccia: 2, pizza: 1 }, status: "picked-up" },
];

function buildOrder(row: SeedRow, index: number): Order {
  const dates = bakeDatesForWeek(row.week);
  const pickupDateId = toISODate(dates[row.day]);
  return {
    id: `seed-${index}`,
    customerName: row.customer,
    phone: row.phone,
    items: Object.entries(row.items).map(([productId, quantity]) => ({
      productId,
      quantity,
    })),
    pickupDateId,
    status: row.status,
    recurring: row.kind === "recurring",
    createdAt: new Date().toISOString(),
  };
}

export const seedAdminOrders: Order[] = rows.map(buildOrder);

// One upcoming order for the mock "logged-in" customer, so /my-orders has
// something real to show without requiring the visitor to place one first.
export const seedMyOrder: Order = {
  id: "seed-mine-1",
  customerName: mockCustomer.name,
  phone: mockCustomer.phone,
  email: mockCustomer.email,
  items: [
    { productId: "classic", quantity: 2 },
    { productId: "focaccia", quantity: 1 },
  ],
  pickupDateId: toISODate(nextDateForWeekday(3)),
  status: "received",
  recurring: true,
  recurringOrderId: "seed-mine-recurring",
  createdAt: new Date().toISOString(),
};

export { STATUS_BY_INDEX };
