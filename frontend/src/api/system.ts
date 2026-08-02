import { apiClient } from "@/api/client";
import type { SystemStatus } from "@/types/api";

export async function getSystemStatus(): Promise<SystemStatus> {
  const { data } = await apiClient.get<SystemStatus>("/api/system/status");
  return data;
}