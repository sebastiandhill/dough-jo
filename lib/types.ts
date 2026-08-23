export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // "loaf", "pan", "crust"
  image: string; // path under /public
  photoHint: string;
  available: boolean;
  maxPerBakeDay: number;
  custom?: boolean;
}

export interface PickupDate {
  id: string; // ISO date, e.g. "2026-08-25"
  date: string; // ISO date
  weekday: string; // "Tuesday"
  label: string; // "August 25"
  long: string; // "Tuesday, August 25"
  pickupWindow: string; // "3:00 - 6:00 PM"
  available: boolean;
  remainingCapacity: number;
}

export type OrderStatus = "received" | "baking" | "ready" | "picked-up";

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  items: OrderItem[];
  pickupDateId: string;
  status: OrderStatus;
  recurring: boolean;
  recurringOrderId?: string;
  createdAt: string; // ISO datetime
}

export type RecurringFrequency = "weekly" | "every-other" | "monthly";
export type RecurringStatus = "active" | "paused" | "cancelled";

export interface RecurringOrder {
  id: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  frequency: RecurringFrequency;
  weekday: number; // 0=Sun..6=Sat
  weekOfMonth?: number; // 1-4, only for monthly
  status: RecurringStatus;
  nextPickupDateId: string;
  skippedDateIds: string[];
  createdAt: string;
}

export interface BakerySettings {
  leadTimeDays: number;
  availableBakeWeekdays: number[]; // [2, 3] = Tue, Wed
  pickupWindow: string;
  businessName: string;
  location: string;
  phone: string;
}
