import { apiClient } from "@/api/client";
import type { ActuatorHealth, ActuatorMetric } from "@/types/api";

export async function getActuatorHealth(): Promise<ActuatorHealth> {
  const { data } = await apiClient.get<ActuatorHealth>("/actuator/health");
  return data;
}

export async function getActuatorMetric(name: string): Promise<ActuatorMetric> {
  const { data } = await apiClient.get<ActuatorMetric>(`/actuator/metrics/${name}`);
  return data;
}