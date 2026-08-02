import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActuatorMetric } from "@/hooks/useActuatorMetric";

interface MetricCardProps {
  metricName: string;
  label: string;
  format?: (value: number) => string;
  icon?: ReactNode;
}

export function MetricCard({ metricName, label, format, icon }: MetricCardProps) {
  const { data, isLoading, isError } = useActuatorMetric(metricName);

  const rawValue = data?.measurements.find((m) => m.statistic === "VALUE")?.value
    ?? data?.measurements[0]?.value;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
        {icon && <span className="text-[var(--color-text-muted)]">{icon}</span>}
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-6 w-20" />
      ) : isError || rawValue === undefined ? (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">n/a</p>
      ) : (
        <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--color-text-primary)]">
          {format ? format(rawValue) : rawValue.toFixed(0)}
        </p>
      )}
    </Card>
  );
}