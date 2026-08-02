import { useQuery } from "@tanstack/react-query";
import { getIncident, listIncidents } from "@/api/incidents";
import type { IncidentFilters } from "@/types/api";

export function useIncidents(filters: IncidentFilters) {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => listIncidents(filters),
    placeholderData: (previous) => previous,
  });
}

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: () => getIncident(id as string),
    enabled: Boolean(id),
  });
}