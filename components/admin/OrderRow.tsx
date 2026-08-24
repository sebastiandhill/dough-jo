import type { Order, Product } from "@/lib/types";
import { describeItems } from "@/lib/utils";
import { STATUS_LABEL, STATUS_BADGE_TONE } from "@/lib/admin-utils";
import { nextOrderStatus } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function OrderRow({
  order,
  products,
  onAdvance,
}: {
  order: Order;
  products: Product[];
  onAdvance: (status: Order["status"]) => void;
}) {
  const done = order.status === "picked-up";
  // A "received" order hasn't been touched yet — make its action stand out
  // in red so new orders are impossible to miss on a busy board.
  const isNew = order.status === "received";
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between py-3.5 border-t border-divider">
      <div className="min-w-0">
        <div className="font-heading text-[23px] font-semibold">
          {order.customerName}
        </div>
        <div className="text-lg text-neutral-700">
          {describeItems(order.items, products)} · {order.phone} ·{" "}
          {order.recurring ? "Regular order" : "One-time"}
        </div>
      </div>
      <div className="flex items-center gap-3.5 flex-wrap">
        <Badge tone={STATUS_BADGE_TONE[order.status]}>
          {STATUS_LABEL[order.status]}
        </Badge>
        <Button
          size="sm"
          variant={done ? "secondary" : isNew ? "danger" : "primary"}
          disabled={done}
          onClick={() => onAdvance(nextOrderStatus(order.status))}
        >
          {done ? "Complete" : `Mark ${STATUS_LABEL[nextOrderStatus(order.status)].toLowerCase()}`}
        </Button>
      </div>
    </div>
  );
}
