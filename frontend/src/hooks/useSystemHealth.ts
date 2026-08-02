import { useQuery } from "@tanstack/react-query";
import { getActuatorHealth } from "@/api/actuator";
import { getSystemStatus } from "@/api/system";

export function useActuatorHealth() {
  return useQuery({
    queryKey: ["actuator-health"],
    queryFn: getActuatorHealth,
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