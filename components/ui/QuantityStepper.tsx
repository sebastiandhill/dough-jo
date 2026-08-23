import { cx } from "@/lib/utils";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "md" | "lg";
  label?: string;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "lg",
  label,
}: QuantityStepperProps) {
  const cell = size === "lg" ? "w-14 h-14 text-[28px]" : "w-12 h-12 text-2xl";
  return (
    <div className="inline-flex items-center border border-divider rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= 0}
        aria-label={label ? `Remove one ${label}` : "Remove one"}
        className={cx(
          cell,
          "flex items-center justify-center bg-transparent border-0 border-r border-divider cursor-pointer hover:bg-black/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        –
      </button>
      <span
        className="min-w-16 text-center font-heading text-[26px] tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={label ? `Add one ${label}` : "Add one"}
        className={cx(
          cell,
          "flex items-center justify-center bg-transparent border-0 border-l border-divider cursor-pointer hover:bg-black/[0.05]"
        )}
      >
        +
      </button>
    </div>
  );
}
