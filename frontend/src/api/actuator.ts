import { apiClient } from "@/api/client";
import type { ActuatorHealth, ActuatorMetric } from "@/types/api";

export async function getActuatorHealth(): Promise<ActuatorHealth> {
  const { data } = await apiClient.get<ActuatorHealth>("/actuator/health");
  return data;
}

// The root /actuator/health endpoint intentionally omits component detail in
// production (no auth layer exists to be "authorized" under). The "dashboard"
// health group exposes just db + diskSpace detail for this UI - see
// application.properties for what it includes and why.
export async function getActuatorHealthDashboardGroup(): Promise<ActuatorHealth> {
  const { data } = await apiClient.get<ActuatorHealth>("/actuator/health/dashboard");
  return data;
}

export async function getActuatorMetric(name: string): Promise<ActuatorMetric> {
  const { data } = await apiClient.get<ActuatorMetric>(`/actuator/metrics/${name}`);
  return data;
}