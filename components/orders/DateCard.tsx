import { cx } from "@/lib/utils";
import type { PickupDate } from "@/lib/types";

export function DateCard({
  date,
  selected,
  fits = true,
  onSelect,
}: {
  date: PickupDate;
  selected: boolean;
  /** False if the customer's current cart no longer fits this date — e.g.
   * it was selected, then a recurring reservation or another order used up
   * what was left. Still shown (so the switch away is visible) but flagged. */
  fits?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        "text-left cursor-pointer p-6 rounded-md min-h-[120px] font-body",
        !fits
          ? "border-2 border-accent-600 bg-accent-100"
          : selected
          ? "border-2 border-accent bg-accent-100"
          : "border border-divider bg-neutral-100"
      )}
    >
      <span className="font-heading text-[32px] font-semibold block">
        {date.weekday}
      </span>
      <span className="text-[22px] tabular-nums block mt-1">{date.label}</span>
      <span
        className={cx(
          "text-[17px] block mt-3",
          !fits ? "text-accent-800 font-semibold" : "text-neutral-700"
        )}
      >
        {!fits
          ? "Not enough left this day for your order — pick another date"
          : date.remainingCapacity <= 3
          ? `Only ${date.remainingCapacity} left this day`
          : `Pickup ${date.pickupWindow}`}
      </span>
    </button>
  );
}
