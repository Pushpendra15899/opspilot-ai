import { useQuery } from "@tanstack/react-query";
import { getActuatorMetric } from "@/api/actuator";

export function useActuatorMetric(name: string) {
  return useQuery({
    queryKey: ["actuator-metric", name],
    queryFn: () => getActuatorMetric(name),
    refetchInterval: 15_000,
  });
}