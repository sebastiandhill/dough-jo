import { cx } from "@/lib/utils";
import type { PickupDate } from "@/lib/types";

export function DateCard({
  date,
  selected,
  onSelect,
}: {
  date: PickupDate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        "text-left cursor-pointer p-6 rounded-md min-h-[120px] font-body",
        selected
          ? "border-2 border-accent bg-accent-100"
          : "border border-divider bg-neutral-100"
      )}
    >
      <span className="font-heading text-[32px] font-semibold block">
        {date.weekday}
      </span>
      <span className="text-[22px] tabular-nums block mt-1">{date.label}</span>
      <span className="text-[17px] block mt-3 text-neutral-700">
        {date.remainingCapacity <= 3
          ? `Only ${date.remainingCapacity} left this day`
          : `Pickup ${date.pickupWindow}`}
      </span>
    </button>
  );
}
