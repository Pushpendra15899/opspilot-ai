import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { EndpointRow } from "@/components/apidocs/EndpointRow";
import { useOpenApiSpec } from "@/hooks/useOpenApiSpec";
import { sortMethods } from "@/lib/apiDocsPresentation";
import type { OpenApiEndpoint, OpenApiMethod } from "@/types/openapi";
import { IconBook, IconExternalLink } from "@/components/ui/icons";

const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
const SWAGGER_URL = `${API_BASE}/swagger-ui/index.html`;
const OPENAPI_JSON_URL = `${API_BASE}/v3/api-docs`;

function groupByTag(spec: NonNullable<ReturnType<typeof useOpenApiSpec>["data"]>) {
  const groups = new Map<string, OpenApiEndpoint[]>();

  for (const [path, methods] of Object.entries(spec.paths)) {
    const entries = Object.entries(methods) as [OpenApiMethod, (typeof methods)[OpenApiMethod]][];
    for (const [method, operation] of entries) {
      if (!operation) continue;
      const tag = operation.tags?.[0] ?? "Other";
      const endpoint: OpenApiEndpoint = { path, method, operation };
      groups.set(tag, [...(groups.get(tag) ?? []), endpoint]);
    }
  }

  for (const endpoints of groups.values()) {
    endpoints.sort((a, b) => a.path.localeCompare(b.path) || sortMethods([a.method, b.method]).indexOf(a.method));
  }

  const orderedTagNames = spec.tags?.map((t) => t.name) ?? [];
  const allTagNames = [...groups.keys()];
  const ordered = [
    ...orderedTagNames.filter((name) => groups.has(name)),
    ...allTagNames.filter((name) => !orderedTagNames.includes(name)),
  ];

  return ordered.map((name) => ({
    name,
    description: spec.tags?.find((t) => t.name === name)?.description,
    endpoints: groups.get(name) ?? [],
  }));
}

export function ApiDocsPage() {
  const { data: spec, isLoading, isError, error, refetch } = useOpenApiSpec();

  return (
    <>
      <PageHeader
        title="API Documentation"
        description="Every endpoint below is generated directly from the running backend — nothing here is hand-maintained."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => window.open(OPENAPI_JSON_URL, "_blank")}>
              Raw JSON
            </Button>
            <Button variant="primary" onClick={() => window.open(SWAGGER_URL, "_blank")}>
              <IconExternalLink className="h-4 w-4" />
              Interactive console
            </Button>
          </div>
        }
      />

      {isError ? (
        <Card>
          <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
        </Card>
      ) : isLoading || !spec ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-40" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                <IconBook className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {spec.info.title}{" "}
                  <span className="font-normal text-[var(--color-text-muted)]">· {spec.info.version}</span>
                </p>
                {spec.info.description && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{spec.info.description}</p>
                )}
              </div>
            </div>
          </Card>

          {groupByTag(spec).map((group) => (
            <Card key={group.name}>
              <CardHeader>
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  {group.description && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{group.description}</p>
                  )}
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                {group.endpoints.map((endpoint) => (
                  <EndpointRow key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
