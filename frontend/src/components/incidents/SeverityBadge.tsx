import { Badge } from "@/components/ui/Badge";
import { SEVERITY_META } from "@/lib/incidentPresentation";
import type { Severity } from "@/types/api";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <Badge color={meta.color} background={meta.background} dot>
      {meta.label}
    </Badge>
  );
}