import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: ReactNode;
  accentColor: string;
  accentBackground: string;
  loading?: boolean;
  hint?: string;
}

export function StatCard({ label, value, icon, accentColor, accentBackground, loading, hint }: StatCardProps) {
  return (
    <Card
      className="p-5"
      style={{ borderTopColor: accentColor, borderTopWidth: 2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {label}
          </p>
          {loading || value === undefined ? (
            <Skeleton className="mt-2.5 h-9 w-16" />
          ) : (
            <p className="mt-1 text-[2rem] font-semibold leading-none tabular-nums text-[var(--color-text-primary)]">
              {value.toLocaleString()}
            </p>
          )}
          <p className="mt-2 h-4 text-xs text-[var(--color-text-muted)]">{hint}</p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
          style={{ color: accentColor, backgroundColor: accentBackground }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}