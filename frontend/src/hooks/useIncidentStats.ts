import { useQuery } from "@tanstack/react-query";
import { getIncidentStats } from "@/api/incidents";

export function useIncidentStats() {
  return useQuery({
    queryKey: ["incident-stats"],
    queryFn: getIncidentStats,
    refetchInterval: 30_000,
  });
}