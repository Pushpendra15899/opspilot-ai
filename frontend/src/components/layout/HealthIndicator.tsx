import { useActuatorHealth } from "@/hooks/useSystemHealth";

export function HealthIndicator() {
  const { data, isError, isLoading } = useActuatorHealth();

  const state = isLoading ? "checking" : isError ? "down" : data?.status === "UP" ? "up" : "degraded";

  const meta = {
    checking: { color: "var(--color-text-muted)", label: "Checking…" },
    up: { color: "var(--color-status-resolved)", label: "All systems operational" },
    degraded: { color: "var(--color-sev-p2)", label: "Degraded" },
    down: { color: "var(--color-sev-p1)", label: "Backend unreachable" },
  }[state];

  return (
    <div
      className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-1)] px-2.5 py-1.5 sm:px-3"
      title={meta.label}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {state === "up" && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: meta.color }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      </span>
      <span className="hidden text-xs font-medium text-[var(--color-text-secondary)] sm:inline">
        {meta.label}
      </span>
    </div>
  );
}