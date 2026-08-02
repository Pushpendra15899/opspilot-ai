import type { KeyboardEvent } from "react";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { StatusBadge } from "@/components/incidents/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/format";
import { SEVERITY_META } from "@/lib/incidentPresentation";
import type { Incident, Page } from "@/types/api";
import { IconAlertTriangle, IconChevronRight } from "@/components/ui/icons";

interface IncidentTableProps {
  page: Page<Incident> | undefined;
  loading: boolean;
  onSelect: (incident: Incident) => void;
  onPageChange: (page: number) => void;
}

export function IncidentTable({ page, loading, onSelect, onPageChange }: IncidentTableProps) {
  if (loading && !page) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (!page || page.content.length === 0) {
    return (
      <EmptyState
        icon={<IconAlertTriangle className="h-5 w-5" />}
        title="No incidents match these filters"
        description="Try clearing filters, or create a new incident to get started."
      />
    );
  }

  function handleKeyDown(e: KeyboardEvent, incident: Incident) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(incident);
    }
  }

  return (
    <div>
      {/* Desktop / tablet: data table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-subtle)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <th className="px-5 py-3 font-medium">Incident</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Severity</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {page.content.map((incident) => (
              <tr
                key={incident.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(incident)}
                onKeyDown={(e) => handleKeyDown(e, incident)}
                className="cursor-pointer transition-colors hover:bg-[var(--color-surface-2)]/60 focus-visible:bg-[var(--color-surface-2)]/60 focus-visible:outline-none"
              >
                <td className="max-w-xs truncate px-5 py-3 font-medium text-[var(--color-text-primary)]">
                  <span className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: SEVERITY_META[incident.severity].color }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{incident.title}</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-[var(--color-text-secondary)]">{incident.service}</td>
                <td className="px-5 py-3">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-5 py-3 text-[var(--color-text-muted)]">
                  {formatDateTime(incident.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="divide-y divide-[var(--color-border-subtle)] md:hidden">
        {page.content.map((incident) => (
          <li key={incident.id}>
            <button
              onClick={() => onSelect(incident)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-2)]/50"
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
                  {incident.service} · {formatDateTime(incident.createdAt)}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
              </div>
              <IconChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 border-t border-[var(--color-border-subtle)] px-4 py-3 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span>
          Showing {page.numberOfElements} of {page.totalElements} incidents
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page.first}
            onClick={() => onPageChange(page.number - 1)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 font-medium hover:bg-[var(--color-surface-2)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page.number + 1} of {Math.max(page.totalPages, 1)}
          </span>
          <button
            disabled={page.last}
            onClick={() => onPageChange(page.number + 1)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 font-medium hover:bg-[var(--color-surface-2)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}