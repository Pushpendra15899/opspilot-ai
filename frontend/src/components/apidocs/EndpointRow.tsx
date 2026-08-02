import { useState } from "react";
import { METHOD_META } from "@/lib/apiDocsPresentation";
import type { OpenApiEndpoint } from "@/types/openapi";
import { IconChevronRight } from "@/components/ui/icons";

export function EndpointRow({ endpoint }: { endpoint: OpenApiEndpoint }) {
  const [open, setOpen] = useState(false);
  const meta = METHOD_META[endpoint.method];
  const { operation } = endpoint;
  const hasDetails =
    Boolean(operation.description && operation.description !== operation.summary) ||
    (operation.parameters?.length ?? 0) > 0 ||
    Boolean(operation.requestBody);

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/30">
      <button
        onClick={() => hasDetails && setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
        aria-expanded={open}
      >
        <span
          className="w-16 shrink-0 rounded-[var(--radius-sm)] py-1 text-center text-[11px] font-bold uppercase tracking-wide"
          style={{ color: meta.color, backgroundColor: meta.background }}
        >
          {endpoint.method}
        </span>
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-[var(--color-text-primary)]">
          {endpoint.path}
        </code>
        {operation.summary && (
          <span className="hidden shrink-0 truncate text-xs text-[var(--color-text-muted)] md:block md:max-w-[40%]">
            {operation.summary}
          </span>
        )}
        {hasDetails && (
          <IconChevronRight
            className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform ${open ? "rotate-90" : ""}`}
          />
        )}
      </button>

      {open && hasDetails && (
        <div className="space-y-3 border-t border-[var(--color-border-subtle)] px-3.5 py-3 text-sm">
          {operation.description && operation.description !== operation.summary && (
            <p className="text-[var(--color-text-secondary)]">{operation.description}</p>
          )}

          {(operation.parameters?.length ?? 0) > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Parameters
              </p>
              <ul className="space-y-1">
                {operation.parameters?.map((param) => (
                  <li key={param.name} className="flex items-center gap-2 text-xs">
                    <code className="rounded bg-[var(--color-surface-3)] px-1.5 py-0.5 font-mono text-[var(--color-text-primary)]">
                      {param.name}
                    </code>
                    <span className="text-[var(--color-text-muted)]">{param.in}</span>
                    {param.required && <span className="text-[var(--color-sev-p1)]">required</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {operation.requestBody && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Request body
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {operation.requestBody.description ??
                  (operation.requestBody.required ? "Required" : "Optional")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
