import { useQuery } from "@tanstack/react-query";
import { getActuatorHealth, getActuatorHealthDashboardGroup } from "@/api/actuator";
import { getSystemStatus } from "@/api/system";

export function useActuatorHealth() {
  return useQuery({
    queryKey: ["actuator-health"],
    queryFn: getActuatorHealth,
    refetchInterval: 15_000,
    retry: 1,
  });
}

// Per-component health (db, diskSpace) for the Observability page's health
// panel - see getActuatorHealthDashboardGroup for why this is a separate
// endpoint from the overall UP/DOWN status above.
export function useActuatorHealthComponents() {
  return useQuery({
    queryKey: ["actuator-health-dashboard"],
    queryFn: getActuatorHealthDashboardGroup,
    refetchInterval: 15_000,
    retry: 1,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: getSystemStatus,
    refetchInterval: 30_000,
  });
}