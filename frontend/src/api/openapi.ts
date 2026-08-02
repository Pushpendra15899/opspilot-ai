import { apiClient } from "@/api/client";
import type { OpenApiSpec } from "@/types/openapi";

export async function getOpenApiSpec(): Promise<OpenApiSpec> {
  const { data } = await apiClient.get<OpenApiSpec>("/v3/api-docs");
  return data;
}
