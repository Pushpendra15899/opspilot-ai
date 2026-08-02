import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncident, updateIncidentStatus } from "@/api/incidents";
import type { CreateIncidentRequest, UpdateIncidentStatusRequest } from "@/types/api";

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateIncidentRequest) => createIncident(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident-stats"] });
    },
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateIncidentStatusRequest }) =>
      updateIncidentStatus(id, request),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident-stats"] });
      queryClient.setQueryData(["incident", updated.id], updated);
    },
  });
}