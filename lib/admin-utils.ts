import type { OrderStatus } from "@/lib/types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Received",
  baking: "Baking",
  ready: "Ready",
  "picked-up": "Picked up",
};

export const STATUS_BADGE_TONE: Record<OrderStatus, "accent" | "neutral" | "outline"> = {
  received: "neutral",
  baking: "outline",
  ready: "accent",
  "picked-up": "neutral",
};
