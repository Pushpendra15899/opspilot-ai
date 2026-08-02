import type { IncidentStatus, Severity } from "@/types/api";

export const SEVERITY_META: Record<Severity, { label: string; color: string; background: string }> = {
  P1: { label: "P1 · Critical", color: "var(--color-sev-p1)", background: "var(--color-sev-p1-soft)" },
  P2: { label: "P2 · High", color: "var(--color-sev-p2)", background: "var(--color-sev-p2-soft)" },
  P3: { label: "P3 · Medium", color: "var(--color-sev-p3)", background: "var(--color-sev-p3-soft)" },
  P4: { label: "P4 · Low", color: "var(--color-sev-p4)", background: "var(--color-sev-p4-soft)" },
};

export const STATUS_META: Record<IncidentStatus, { label: string; color: string; background: string }> = {
  OPEN: { label: "Open", color: "var(--color-status-open)", background: "var(--color-status-open-soft)" },
  IN_PROGRESS: {
    label: "In Progress",
    color: "var(--color-status-progress)",
    background: "var(--color-status-progress-soft)",
  },
  RESOLVED: {
    label: "Resolved",
    color: "var(--color-status-resolved)",
    background: "var(--color-status-resolved-soft)",
  },
  CLOSED: { label: "Closed", color: "var(--color-status-closed)", background: "var(--color-status-closed-soft)" },
};