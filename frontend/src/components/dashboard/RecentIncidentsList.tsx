import { Link } from "react-router-dom";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { StatusBadge } from "@/components/incidents/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRelativeTime } from "@/lib/format";
import { SEVERITY_META } from "@/lib/incidentPresentation";
import type { Incident } from "@/types/api";
import { IconAlertTriangle, IconChevronRight } from "@/components/ui/icons";

interface RecentIncidentsListProps {
  incidents: Incident[] | undefined;
  loading?: boolean;
}

export function RecentIncidentsList({ incidents, loading }: RecentIncidentsListProps) {
  if (loading || !incidents) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={<IconAlertTriangle className="h-5 w-5" />}
        title="No incidents yet"
        description="Incidents created via the API will show up here."
      />
    );
  }

  return (
    <ul className="-mx-5 divide-y divide-[var(--color-border-subtle)]">
      {incidents.map((incident) => (
        <li key={incident.id}>
          <Link
            to={`/incidents?open=${incident.id}`}
            className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--color-surface-2)]/50"
          >
            <span
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: SEVERITY_META[incident.severity].color }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {incident.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                {incident.service} · {formatRelativeTime(incident.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SeverityBadge severity={incident.severity} />
              <span className="hidden sm:inline-flex">
                <StatusBadge status={incident.status} />
              </span>
              <IconChevronRight className="h-4 w-4 text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}