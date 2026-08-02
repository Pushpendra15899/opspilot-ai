import type { OpenApiMethod } from "@/types/openapi";

export const METHOD_META: Record<OpenApiMethod, { color: string; background: string }> = {
  get: { color: "var(--color-status-progress)", background: "var(--color-status-progress-soft)" },
  post: { color: "var(--color-status-resolved)", background: "var(--color-status-resolved-soft)" },
  put: { color: "var(--color-sev-p3)", background: "var(--color-sev-p3-soft)" },
  patch: { color: "var(--color-sev-p2)", background: "var(--color-sev-p2-soft)" },
  delete: { color: "var(--color-sev-p1)", background: "var(--color-sev-p1-soft)" },
};

const METHOD_ORDER: OpenApiMethod[] = ["get", "post", "put", "patch", "delete"];

export function sortMethods(methods: OpenApiMethod[]): OpenApiMethod[] {
  return [...methods].sort((a, b) => METHOD_ORDER.indexOf(a) - METHOD_ORDER.indexOf(b));
}
