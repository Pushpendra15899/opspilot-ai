import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  background?: string;
  dot?: boolean;
}

export function Badge({ className, color, background, dot, style, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        color: color ?? "var(--color-text-secondary)",
        backgroundColor: background ?? "var(--color-surface-2)",
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}