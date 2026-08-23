import { cx } from "@/lib/utils";

type Tone = "accent" | "neutral" | "outline";

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  const toneClasses: Record<Tone, string> = {
    accent: "bg-accent-100 text-accent-800",
    neutral: "bg-neutral-100 text-neutral-800",
    outline: "border border-accent text-accent-700",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-sm px-3.5 py-2 text-[17px] whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
