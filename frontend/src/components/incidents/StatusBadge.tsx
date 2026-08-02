import { Badge } from "@/components/ui/Badge";
import { STATUS_META } from "@/lib/incidentPresentation";
import type { IncidentStatus } from "@/types/api";

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge color={meta.color} background={meta.background} dot>
      {meta.label}
    </Badge>
  );
}