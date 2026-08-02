import { apiClient } from "@/api/client";
import type {
  CreateIncidentRequest,
  Incident,
  IncidentFilters,
  IncidentStats,
  Page,
  UpdateIncidentStatusRequest,
} from "@/types/api";

export async function listIncidents(filters: IncidentFilters): Promise<Page<Incident>> {
  const { data } = await apiClient.get<Page<Incident>>("/api/incidents", {
    params: filters,
  });
  return data;
}

export async function getIncident(id: string): Promise<Incident> {
  const { data } = await apiClient.get<Incident>(`/api/incidents/${id}`);
  return data;
}

export async function getIncidentStats(): Promise<IncidentStats> {
  const { data } = await apiClient.get<IncidentStats>("/api/incidents/stats");
  return data;
}

export async function createIncident(request: CreateIncidentRequest): Promise<Incident> {
  const { data } = await apiClient.post<Incident>("/api/incidents", request);
  return data;
}

export async function updateIncidentStatus(
  id: string,
  request: UpdateIncidentStatusRequest,
): Promise<Incident> {
  const { data } = await apiClient.patch<Incident>(`/api/incidents/${id}/status`, request);
  return data;
}