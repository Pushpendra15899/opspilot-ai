import { useActuatorHealthComponents } from "@/hooks/useSystemHealth";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconDatabase, IconServer } from "@/components/ui/icons";

const COMPONENT_ICON: Record<string, typeof IconDatabase> = {
  db: IconDatabase,
};

function statusMeta(status: string) {
  if (status === "UP") return { color: "var(--color-status-resolved)", background: "var(--color-status-resolved-soft)" };
  if (status === "DOWN") return { color: "var(--color-sev-p1)", background: "var(--color-sev-p1-soft)" };
  return { color: "var(--color-sev-p2)", background: "var(--color-sev-p2-soft)" };
}

interface HealthPanelProps {
  compact?: boolean;
}

export function HealthPanel({ compact }: HealthPanelProps) {
  const { data, isLoading, isError, error, refetch } = useActuatorHealthComponents();

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: compact ? 4 : 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />;
  }

  const components = Object.entries(data.components ?? {}).filter(
    ([name]) => !compact || !["ping", "ssl"].includes(name),
  );

  return (
    <div className="space-y-2.5">
      {components.map(([name, component]) => {
        const Icon = COMPONENT_ICON[name] ?? IconServer;
        const meta = statusMeta(component.status);
        const detail = !compact && component.details ? summarizeDetails(name, component.details) : null;

        return (
          <div
            key={name}
            className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40 py-2.5 pl-3 pr-3"
            style={{ borderLeft: `2px solid ${meta.color}` }}
          >
            <Icon className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {formatComponentName(name)}
              </p>
              {detail && <p className="truncate text-xs text-[var(--color-text-muted)]">{detail}</p>}
            </div>
            <Badge color={meta.color} background={meta.background} dot>
              {component.status}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

function formatComponentName(name: string) {
  if (name === "db") return "Database";
  if (name === "diskSpace") return "Disk space";
  if (name === "livenessState") return "Liveness";
  if (name === "readinessState") return "Readiness";
  if (name === "ssl") return "SSL";
  if (name === "ping") return "Ping";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function summarizeDetails(name: string, details: Record<string, unknown>): string | null {
  if (name === "db" && typeof details.database === "string") {
    return details.database;
  }
  if (name === "diskSpace" && typeof details.free === "number" && typeof details.total === "number") {
    const pct = ((details.free / details.total) * 100).toFixed(0);
    return `${pct}% free`;
  }
  return null;
}