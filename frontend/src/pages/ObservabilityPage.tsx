import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { HealthPanel } from "@/components/observability/HealthPanel";
import { MetricCard } from "@/components/observability/MetricCard";
import { GaugeMetricCard } from "@/components/observability/GaugeMetricCard";
import { useActuatorHealth, useSystemStatus } from "@/hooks/useSystemHealth";
import { useActuatorMetric } from "@/hooks/useActuatorMetric";
import { formatBytes, formatDuration } from "@/lib/format";
import { IconActivity, IconCpu, IconDatabase } from "@/components/ui/icons";

function StatusBanner() {
  const health = useActuatorHealth();
  const system = useSystemStatus();
  const uptime = useActuatorMetric("process.uptime");

  const uptimeSeconds = uptime.data?.measurements.find((m) => m.statistic === "VALUE")?.value;
  const up = health.data?.status === "UP";
  const state = health.isLoading ? "checking" : health.isError ? "down" : up ? "up" : "degraded";

  const meta = {
    checking: { color: "var(--color-text-muted)", label: "Checking system status…" },
    up: { color: "var(--color-status-resolved)", label: "All systems operational" },
    degraded: { color: "var(--color-sev-p2)", label: "System degraded" },
    down: { color: "var(--color-sev-p1)", label: "Backend unreachable" },
  }[state];

  return (
    <Card className="mb-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 shrink-0">
          {state === "up" && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
              style={{ backgroundColor: meta.color }}
            />
          )}
          <span className="relative inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: meta.color }} />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{meta.label}</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {system.data
              ? `${system.data.application} · ${system.data.environment} · Java ${system.data.javaVersion}`
              : "Loading environment info…"}
          </p>
        </div>
      </div>
      {uptimeSeconds !== undefined && (
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40 px-3 py-2">
          <span className="text-xs text-[var(--color-text-muted)]">Uptime</span>
          <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {formatDuration(uptimeSeconds)}
          </span>
        </div>
      )}
    </Card>
  );
}

export function ObservabilityPage() {
  return (
    <>
      <PageHeader
        title="Observability"
        description="Live application, database, and JVM signals via Spring Boot Actuator."
      />

      <StatusBanner />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Health checks</CardTitle>
          </CardHeader>
          <CardBody>
            <HealthPanel />
          </CardBody>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCpu className="h-4 w-4" /> JVM runtime
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <GaugeMetricCard
                  label="Heap + non-heap memory"
                  valueMetric="jvm.memory.used"
                  maxMetric="jvm.memory.max"
                  format={formatBytes}
                />
                <MetricCard metricName="process.uptime" label="Uptime" format={formatDuration} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard metricName="jvm.threads.live" label="Live threads" />
                <MetricCard metricName="jvm.threads.daemon" label="Daemon threads" />
                <MetricCard metricName="jvm.classes.loaded" label="Classes loaded" />
                <MetricCard metricName="process.cpu.usage" label="CPU usage" format={(v) => `${(v * 100).toFixed(1)}%`} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDatabase className="h-4 w-4" /> Database connection pool
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <GaugeMetricCard
                  label="Active connections"
                  valueMetric="hikaricp.connections.active"
                  maxMetric="hikaricp.connections.max"
                  format={(v) => v.toFixed(0)}
                />
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard metricName="hikaricp.connections.idle" label="Idle" />
                  <MetricCard metricName="hikaricp.connections.pending" label="Pending" />
                  <MetricCard metricName="hikaricp.connections.timeout" label="Timeouts" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="h-4 w-4" /> Host & traffic signals
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard metricName="http.server.requests.active" label="Active requests" />
                <MetricCard metricName="disk.free" label="Disk free" format={formatBytes} />
                <MetricCard metricName="jvm.gc.pause" label="GC pauses" />
                <MetricCard metricName="logback.events" label="Log events" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
