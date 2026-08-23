import type { RecurringOrder } from "@/lib/types";
import { mockCustomer } from "@/lib/mock-data/seed-customer";
import { toISODate, nextDateForWeekday } from "@/lib/dates";

export const seedMyRecurringOrder: RecurringOrder = {
  id: "seed-mine-recurring",
  customerName: mockCustomer.name,
  phone: mockCustomer.phone,
  items: [
    { productId: "classic", quantity: 2 },
    { productId: "focaccia", quantity: 1 },
  ],
  frequency: "every-other",
  weekday: 3, // Wednesday
  status: "active",
  nextPickupDateId: toISODate(nextDateForWeekday(3)),
  skippedDateIds: [],
  createdAt: new Date().toISOString(),
};
