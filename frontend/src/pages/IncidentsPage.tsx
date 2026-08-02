import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import type { IncidentFilterState } from "@/components/incidents/IncidentFilters";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { CreateIncidentModal } from "@/components/incidents/CreateIncidentModal";
import { IncidentDetailModal } from "@/components/incidents/IncidentDetailModal";
import { useIncidents } from "@/hooks/useIncidents";
import { IconPlus } from "@/components/ui/icons";
import type { Incident } from "@/types/api";

const PAGE_SIZE = 20;

export function IncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<IncidentFilterState>({});
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const openIncidentId = searchParams.get("open") ?? undefined;

  const incidents = useIncidents({
    ...filters,
    page,
    size: PAGE_SIZE,
    sort: "createdAt,desc",
  });

  function updateFilters(next: IncidentFilterState) {
    setFilters(next);
    setPage(0);
  }

  function openIncident(incident: Incident) {
    setSearchParams((params) => {
      params.set("open", incident.id);
      return params;
    });
  }

  function closeIncident() {
    setSearchParams((params) => {
      params.delete("open");
      return params;
    });
  }

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Track, filter, and manage the lifecycle of production incidents."
        action={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <IconPlus className="h-4 w-4" />
            New incident
          </Button>
        }
      />

      <div className="mb-4">
        <IncidentFilters value={filters} onChange={updateFilters} />
      </div>

      <Card>
        {incidents.isError ? (
          <ErrorState message={(incidents.error as Error)?.message} onRetry={() => incidents.refetch()} />
        ) : (
          <IncidentTable
            page={incidents.data}
            loading={incidents.isLoading}
            onSelect={openIncident}
            onPageChange={setPage}
          />
        )}
      </Card>

      <CreateIncidentModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <IncidentDetailModal incidentId={openIncidentId} onClose={closeIncident} />
    </>
  );
}