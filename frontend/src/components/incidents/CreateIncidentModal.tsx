import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateIncident } from "@/hooks/useIncidentMutations";
import { ApiError } from "@/api/client";
import type { Severity } from "@/types/api";

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none";
const inputErrorClass = "border-[var(--color-sev-p1)]/60";

interface CreateIncidentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateIncidentModal({ open, onClose }: CreateIncidentModalProps) {
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [severity, setSeverity] = useState<Severity>("P3");
  const mutation = useCreateIncident();

  const fieldErrors = mutation.error instanceof ApiError ? mutation.error.fieldErrors : undefined;

  function handleClose() {
    setTitle("");
    setService("");
    setSeverity("P3");
    mutation.reset();
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate(
      { title, service, severity },
      { onSuccess: handleClose },
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create incident">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            Title <span className="text-[var(--color-sev-p1)]">*</span>
          </label>
          <input
            className={`${inputClass} ${fieldErrors?.title ? inputErrorClass : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Payment gateway timeout"
            autoFocus
          />
          {fieldErrors?.title && <p className="mt-1 text-xs text-[var(--color-sev-p1)]">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            Service <span className="text-[var(--color-sev-p1)]">*</span>
          </label>
          <input
            className={`${inputClass} ${fieldErrors?.service ? inputErrorClass : ""}`}
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="payments-service"
          />
          {fieldErrors?.service && <p className="mt-1 text-xs text-[var(--color-sev-p1)]">{fieldErrors.service}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">Severity</label>
          <select
            className={inputClass}
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            <option value="P1">P1 · Critical</option>
            <option value="P2">P2 · High</option>
            <option value="P3">P3 · Medium</option>
            <option value="P4">P4 · Low</option>
          </select>
        </div>

        {mutation.isError && !fieldErrors && (
          <p className="text-xs text-[var(--color-sev-p1)]">
            {(mutation.error as Error).message ?? "Failed to create incident."}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending || !title || !service}>
            {mutation.isPending ? "Creating…" : "Create incident"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}