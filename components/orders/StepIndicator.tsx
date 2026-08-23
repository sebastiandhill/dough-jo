import { cx } from "@/lib/utils";

export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex gap-5 text-[17px] tracking-[0.08em] uppercase text-neutral-700 mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        return (
          <span
            key={label}
            className={cx(
              "pb-1.5 border-b-2",
              n === current
                ? "text-accent-800 border-accent"
                : "border-transparent"
            )}
          >
            {n} · {label}
          </span>
        );
      })}
    </div>
  );
}
