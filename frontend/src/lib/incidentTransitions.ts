import type { IncidentStatus } from "@/types/api";

/**
 * Mirrors IncidentStatus.ALLOWED_TRANSITIONS in the backend, for UX only
 * (disabling invalid actions). The backend is the source of truth and
 * still rejects illegal transitions with 409.
 */
const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
};

export function allowedNextStatuses(current: IncidentStatus): IncidentStatus[] {
  return ALLOWED_TRANSITIONS[current];
}