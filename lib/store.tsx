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
import {
  seedAdminOrders,
  seedMyOrder,
} from "@/lib/mock-data/seed-orders";
import { seedMyRecurringOrder } from "@/lib/mock-data/seed-recurring";
import { mockCustomer } from "@/lib/mock-data/seed-customer";
import { getAvailablePickupDates as computeBaseDates } from "@/lib/dates";

interface DoughState {
  products: Product[];
  orders: Order[];
  recurringOrders: RecurringOrder[];
}

const initialState: DoughState = {
  products: initialProducts,
  orders: [...seedAdminOrders, seedMyOrder],
  recurringOrders: [seedMyRecurringOrder],
};

const STORAGE_KEY = "dough-jo-mock-store-v1";

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
        "status" | "items" | "weekday" | "frequency" | "nextPickupDateId"
      >
    > & { skipDateId?: string }
  ) => void;

  // ---- admin-facing mutations ----
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleProductAvailability: (productId: string) => void;
  updateProductCap: (productId: string, cap: number) => void;
  addProduct: (input: NewProductInput) => Product;
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
    (count = 4) => {
      const candidates = computeBaseDates(20);
      const withLiveCapacity = candidates.map((d) => {
        const consumed = state.orders
          .filter((o) => o.pickupDateId === d.id)
          .flatMap((o) => o.items)
          .reduce((sum, item) => sum + item.quantity, 0);
        const remainingCapacity = Math.max(0, d.remainingCapacity - consumed);
        return { ...d, remainingCapacity, available: remainingCapacity > 0 };
      });
      return withLiveCapacity.filter((d) => d.available).slice(0, count);
    },
    [state.orders]
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

  const value = useMemo<DoughApi>(
    () => ({
      products: state.products,
      orders: state.orders,
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
    }),
    [
      state.products,
      state.orders,
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
    ]
  );

  return <DoughContext.Provider value={value}>{children}</DoughContext.Provider>;
}

export function useDough(): DoughApi {
  const ctx = useContext(DoughContext);
  if (!ctx) throw new Error("useDough must be used within DoughStoreProvider");
  return ctx;
}
