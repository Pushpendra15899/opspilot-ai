import { Skeleton } from "@/components/ui/Skeleton";
import { useActuatorMetric } from "@/hooks/useActuatorMetric";

interface GaugeMetricCardProps {
  label: string;
  valueMetric: string;
  maxMetric: string;
  format: (value: number) => string;
}

function extractValue(measurements: { statistic: string; value: number }[] | undefined) {
  return measurements?.find((m) => m.statistic === "VALUE")?.value ?? measurements?.[0]?.value;
}

export function GaugeMetricCard({ label, valueMetric, maxMetric, format }: GaugeMetricCardProps) {
  const used = useActuatorMetric(valueMetric);
  const max = useActuatorMetric(maxMetric);

  const usedValue = extractValue(used.data?.measurements);
  const maxValue = extractValue(max.data?.measurements);
  const loading = used.isLoading || max.isLoading;
  const ready = usedValue !== undefined && maxValue !== undefined && maxValue > 0;
  const percent = ready ? Math.min(100, (usedValue / maxValue) * 100) : 0;

  const barColor =
    percent >= 90
      ? "var(--color-sev-p1)"
      : percent >= 70
        ? "var(--color-sev-p2)"
        : "var(--color-status-resolved)";

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
        {!loading && ready && (
          <span className="text-xs font-semibold tabular-nums text-[var(--color-text-secondary)]">
            {percent.toFixed(0)}%
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-5 w-24" />
      ) : ready ? (
        <>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
            {format(usedValue)}{" "}
            <span className="text-xs font-normal text-[var(--color-text-muted)]">/ {format(maxValue)}</span>
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${percent}%`, backgroundColor: barColor }}
            />
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">n/a</p>
      )}
    </div>
  );
}
