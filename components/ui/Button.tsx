import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: "min-h-[48px] px-5 py-3 text-[17px]",
  md: "min-h-[56px] px-7 py-4 text-[20px]",
  lg: "min-h-[60px] px-8 py-[18px] text-[21px]",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "text-accent-800 bg-accent-100 border-2 border-accent hover:bg-accent-200",
  secondary:
    "text-text bg-transparent border border-divider hover:bg-black/[0.05]",
  ghost: "text-text bg-transparent border-0 underline underline-offset-4",
  danger:
    "text-white bg-red-600 border-2 border-red-600 hover:bg-red-700 hover:border-red-700",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "font-heading font-semibold tracking-[0.06em] rounded-md cursor-pointer transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-45 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
