import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { StatusBadge } from "@/components/incidents/StatusBadge";
import { useIncident } from "@/hooks/useIncidents";
import { useUpdateIncidentStatus } from "@/hooks/useIncidentMutations";
import { allowedNextStatuses } from "@/lib/incidentTransitions";
import { formatDateTime } from "@/lib/format";
import { STATUS_META } from "@/lib/incidentPresentation";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconCheck, IconCopy } from "@/components/ui/icons";

interface IncidentDetailModalProps {
  incidentId: string | undefined;
  onClose: () => void;
}

export function IncidentDetailModal({ incidentId, onClose }: IncidentDetailModalProps) {
  const { data: incident, isLoading } = useIncident(incidentId);
  const updateStatus = useUpdateIncidentStatus();
  const [copied, setCopied] = useState(false);

  function handleClose() {
    updateStatus.reset();
    setCopied(false);
    onClose();
  }

  async function handleCopyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by the browser/OS — fail silently, the ID is still selectable text.
    }
  }

  return (
    <Modal open={Boolean(incidentId)} onClose={handleClose} title="Incident details">
      {isLoading || !incident ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-base font-semibold leading-snug text-[var(--color-text-primary)]">
              {incident.title}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {incident.service} · Created {formatDateTime(incident.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
                Incident ID
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-[var(--color-text-secondary)]">
                {incident.id}
              </p>
            </div>
            <button
              onClick={() => handleCopyId(incident.id)}
              className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]"
            >
              {copied ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-[var(--color-status-resolved)]" /> Copied
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">Transition status</p>
            {allowedNextStatuses(incident.status).length === 0 ? (
              <p className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40 px-3 py-2.5 text-xs text-[var(--color-text-muted)]">
                This incident is closed — no further transitions available.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allowedNextStatuses(incident.status).map((next) => (
                  <Button
                    key={next}
                    variant="secondary"
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: incident.id, request: { status: next } })}
                    style={{ borderColor: STATUS_META[next].color }}
                  >
                    {updateStatus.isPending && updateStatus.variables?.request.status === next
                      ? "Updating…"
                      : `Mark as ${STATUS_META[next].label}`}
                  </Button>
                ))}
              </div>
            )}
            {updateStatus.isError && (
              <p className="mt-2 text-xs text-[var(--color-sev-p1)]">
                {(updateStatus.error as Error).message ?? "Failed to update status."}
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}