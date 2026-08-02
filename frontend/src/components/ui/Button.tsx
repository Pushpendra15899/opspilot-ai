import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[#04201c] hover:bg-[var(--color-accent-strong)] focus-visible:outline-[var(--color-accent)]",
  secondary:
    "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
  danger:
    "bg-transparent text-[var(--color-sev-p1)] border border-[var(--color-sev-p1)]/40 hover:bg-[var(--color-sev-p1)]/10",
};

export function Button({ className, variant = "secondary", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantClasses[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}