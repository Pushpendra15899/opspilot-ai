import { useEffect, useState } from "react";
import { IconSearch, IconX } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { IncidentStatus, Severity } from "@/types/api";

export interface IncidentFilterState {
  status?: IncidentStatus;
  severity?: Severity;
  service?: string;
}

interface IncidentFiltersProps {
  value: IncidentFilterState;
  onChange: (value: IncidentFilterState) => void;
}

const STATUSES: IncidentStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const SEVERITIES: Severity[] = ["P1", "P2", "P3", "P4"];

const controlClass =
  "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors";

export function IncidentFilters({ value, onChange }: IncidentFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(value.service ?? "");
  const debouncedSearch = useDebouncedValue(searchDraft, 350);

  useEffect(() => {
    if ((value.service ?? "") !== debouncedSearch) {
      onChange({ ...value, service: debouncedSearch || undefined });
    }
    // Only re-run when the debounced search text settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchDraft(value.service ?? "");
    // Keep the input in sync when filters are cleared externally (e.g. "Clear filters").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.service]);

  const hasActiveFilters = Boolean(value.status || value.severity || value.service);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search by service…"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          className={`${controlClass} w-full pl-8 pr-8 sm:w-56`}
        />
        {searchDraft && (
          <button
            onClick={() => setSearchDraft("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <select
        className={controlClass}
        value={value.status ?? ""}
        onChange={(e) => onChange({ ...value, status: (e.target.value || undefined) as IncidentStatus | undefined })}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.replace("_", " ")}
          </option>
        ))}
      </select>

      <select
        className={controlClass}
        value={value.severity ?? ""}
        onChange={(e) => onChange({ ...value, severity: (e.target.value || undefined) as Severity | undefined })}
        aria-label="Filter by severity"
      >
        <option value="">All severities</option>
        {SEVERITIES.map((severity) => (
          <option key={severity} value={severity}>
            {severity}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({})}
          className="rounded-[var(--radius-md)] px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}