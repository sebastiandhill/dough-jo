"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PickupDate,
  Product,
  RecurringFrequency,
  RecurringOrder,
} from "@/lib/types";
import { initialProducts } from "@/lib/mock-data/products";
import { mockCustomer } from "@/lib/mock-data/seed-customer";
import { getAvailablePickupDates as computeAvailableDates } from "@/lib/dates";
import { recurringOccursOn } from "@/lib/recurring";

interface DoughState {
  products: Product[];
  orders: Order[];
  recurringOrders: RecurringOrder[];
}

const initialState: DoughState = {
  products: initialProducts,
  orders: [],
  recurringOrders: [],
};

// Bumped from v1 -> v2 to drop demo/seed orders that were cached in
// visitors' browsers before the site went live with real data only.
const STORAGE_KEY = "dough-jo-mock-store-v2";

interface NewOrderInput {
  customerName: string;
  phone: string;
  email?: string;
  items: OrderItem[];
  pickupDateId: string;
  recurring?: boolean;
  recurringOrderId?: string;
}

interface NewRecurringOrderInput {
  customerName: string;
  phone: string;
  items: OrderItem[];
  frequency: RecurringFrequency;
  weekday: number;
  weekOfMonth?: number;
  nextPickupDateId: string;
}

interface NewProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
  maxPerBakeDay: number;
}

interface DoughApi {
  // ---- read ----
  products: Product[];
  orders: Order[];
  recurringOrders: RecurringOrder[];
  getProducts: () => Product[];
  getAvailablePickupDates: (count?: number) => PickupDate[];
  getCustomerOrders: () => { orders: Order[]; recurringOrders: RecurringOrder[] };
  getAdminOrders: () => Order[];

  // ---- customer-facing mutations (future: Supabase inserts) ----
  createOrder: (input: NewOrderInput) => Order;
  createRecurringOrder: (input: NewRecurringOrderInput) => RecurringOrder;
  updateRecurringOrder: (
    id: string,
    patch: Partial<
      Pick<
        RecurringOrder,
        | "status"
        | "items"
        | "weekday"
        | "frequency"
        | "nextPickupDateId"
        | "anchorDateId"
      >
    > & { skipDateId?: string }
  ) => void;

  // ---- admin-facing mutations ----
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleProductAvailability: (productId: string) => void;
  updateProductCap: (productId: string, cap: number) => void;
  addProduct: (input: NewProductInput) => Product;
  deleteProduct: (productId: string) => void;
  /** Materializes real, trackable Order rows for any active recurring order
   * that has a projected occurrence on one of these dates and doesn't
   * already have one — called whenever admin views a date range, so every
   * future occurrence (not just the first) shows up with its own status. */
  ensureRecurringOccurrences: (dateIds: string[]) => void;
}

const DoughContext = createContext<DoughApi | null>(null);

const STATUS_ORDER: OrderStatus[] = ["received", "baking", "ready", "picked-up"];

export function nextOrderStatus(status: OrderStatus): OrderStatus {
  const i = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[Math.min(i + 1, STATUS_ORDER.length - 1)];
}

export function DoughStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DoughState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Client-only persistence. Seeds render identically on server and client;
  // any saved session state is merged in after mount, avoiding hydration
  // mismatches while still surviving page reloads.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as DoughState;
        // One-time hydration from a browser API unavailable during SSR —
        // not a derived-state anti-pattern, so the lint rule is silenced here.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(saved);
      }
    } catch {
      // ignore corrupt/unavailable storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage write failures (e.g. private browsing quota)
    }
  }, [state, hydrated]);

  const getProducts = useCallback(() => state.products, [state.products]);

  const getAvailablePickupDates = useCallback(
    (count = 4) =>
      computeAvailableDates(
        state.products,
        state.orders,
        state.recurringOrders,
        count
      ),
    [state.products, state.orders, state.recurringOrders]
  );

  const getCustomerOrders = useCallback(
    () => ({
      orders: state.orders.filter((o) => o.phone === mockCustomer.phone),
      recurringOrders: state.recurringOrders.filter(
        (r) => r.phone === mockCustomer.phone
      ),
    }),
    [state.orders, state.recurringOrders]
  );

  const getAdminOrders = useCallback(() => state.orders, [state.orders]);

  const createOrder = useCallback((input: NewOrderInput): Order => {
    const order: Order = {
      id: `ord-${Date.now()}`,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      items: input.items,
      pickupDateId: input.pickupDateId,
      status: "received",
      recurring: !!input.recurring,
      recurringOrderId: input.recurringOrderId,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, orders: [...s.orders, order] }));
    return order;
  }, []);

  const createRecurringOrder = useCallback(
    (input: NewRecurringOrderInput): RecurringOrder => {
      const recurring: RecurringOrder = {
        id: `rec-${Date.now()}`,
        customerName: input.customerName,
        phone: input.phone,
        items: input.items,
        frequency: input.frequency,
        weekday: input.weekday,
        weekOfMonth: input.weekOfMonth,
        status: "active",
        anchorDateId: input.nextPickupDateId,
        nextPickupDateId: input.nextPickupDateId,
        skippedDateIds: [],
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        recurringOrders: [...s.recurringOrders, recurring],
        orders: [
          ...s.orders,
          {
            id: `ord-${Date.now()}`,
            customerName: input.customerName,
            phone: input.phone,
            items: input.items,
            pickupDateId: input.nextPickupDateId,
            status: "received",
            recurring: true,
            recurringOrderId: recurring.id,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      return recurring;
    },
    []
  );

  const updateRecurringOrder: DoughApi["updateRecurringOrder"] = useCallback(
    (id, patch) => {
      setState((s) => ({
        ...s,
        recurringOrders: s.recurringOrders.map((r) => {
          if (r.id !== id) return r;
          const next = { ...r, ...patch };
          if (patch.skipDateId) {
            next.skippedDateIds = [...r.skippedDateIds, patch.skipDateId];
          }
          return next;
        }),
        // A skipped pickup shouldn't linger as a real order on the baker's
        // board for that date.
        orders: patch.skipDateId
          ? s.orders.filter(
              (o) =>
                !(o.recurringOrderId === id && o.pickupDateId === patch.skipDateId)
            )
          : s.orders,
      }));
    },
    []
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  }, []);

  const toggleProductAvailability = useCallback((productId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === productId ? { ...p, available: !p.available } : p
      ),
    }));
  }, []);

  const updateProductCap = useCallback((productId: string, cap: number) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === productId ? { ...p, maxPerBakeDay: Math.max(0, cap) } : p
      ),
    }));
  }, []);

  const addProduct = useCallback((input: NewProductInput): Product => {
    const product: Product = {
      id: `custom-${Date.now()}`,
      name: input.name,
      description: input.description,
      price: input.price,
      unit: input.unit || "loaf",
      image: "",
      photoHint: "Drop a photo of this product",
      available: false,
      maxPerBakeDay: input.maxPerBakeDay,
      custom: true,
    };
    setState((s) => ({ ...s, products: [...s.products, product] }));
    return product;
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.filter((p) => p.id !== productId),
    }));
  }, []);

  const ensureRecurringOccurrences = useCallback((dateIds: string[]) => {
    setState((s) => {
      const additions: Order[] = [];
      dateIds.forEach((dateId) => {
        s.recurringOrders.forEach((r) => {
          if (!recurringOccursOn(r, dateId)) return;
          const materialized =
            s.orders.some(
              (o) => o.recurringOrderId === r.id && o.pickupDateId === dateId
            ) || additions.some((o) => o.recurringOrderId === r.id && o.pickupDateId === dateId);
          if (materialized) return;
          additions.push({
            id: `ord-${r.id}-${dateId}`,
            customerName: r.customerName,
            phone: r.phone,
            items: r.items,
            pickupDateId: dateId,
            status: "received",
            recurring: true,
            recurringOrderId: r.id,
            createdAt: new Date().toISOString(),
          });
        });
      });
      if (additions.length === 0) return s;
      return { ...s, orders: [...s.orders, ...additions] };
    });
  }, []);

  const value = useMemo<DoughApi>(
    () => ({
      products: state.products,
      orders: state.orders,
      recurringOrders: state.recurringOrders,
      getProducts,
      getAvailablePickupDates,
      getCustomerOrders,
      getAdminOrders,
      createOrder,
      createRecurringOrder,
      updateRecurringOrder,
      updateOrderStatus,
      toggleProductAvailability,
      updateProductCap,
      addProduct,
      deleteProduct,
      ensureRecurringOccurrences,
    }),
    [
      state.products,
      state.orders,
      state.recurringOrders,
      getProducts,
      getAvailablePickupDates,
      getCustomerOrders,
      getAdminOrders,
      createOrder,
      createRecurringOrder,
      updateRecurringOrder,
      updateOrderStatus,
      toggleProductAvailability,
      updateProductCap,
      addProduct,
      deleteProduct,
      ensureRecurringOccurrences,
    ]
  );

  return <DoughContext.Provider value={value}>{children}</DoughContext.Provider>;
}

export function useDough(): DoughApi {
  const ctx = useContext(DoughContext);
  if (!ctx) throw new Error("useDough must be used within DoughStoreProvider");
  return ctx;
}
