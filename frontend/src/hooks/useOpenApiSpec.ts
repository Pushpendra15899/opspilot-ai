import { useQuery } from "@tanstack/react-query";
import { getOpenApiSpec } from "@/api/openapi";

export function useOpenApiSpec() {
  return useQuery({
    queryKey: ["openapi-spec"],
    queryFn: getOpenApiSpec,
    staleTime: 5 * 60_000,
  });
}
