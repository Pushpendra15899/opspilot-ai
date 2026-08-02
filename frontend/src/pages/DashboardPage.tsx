import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncidentTrendChart } from "@/components/dashboard/IncidentTrendChart";
import { RecentIncidentsList } from "@/components/dashboard/RecentIncidentsList";
import { HealthPanel } from "@/components/observability/HealthPanel";
import { useIncidentStats } from "@/hooks/useIncidentStats";
import { useIncidents } from "@/hooks/useIncidents";
import { IconActivity, IconAlertTriangle, IconGrid } from "@/components/ui/icons";
import { STATUS_META } from "@/lib/incidentPresentation";

export function DashboardPage() {
  const stats = useIncidentStats();
  const recent = useIncidents({ size: 6, sort: "createdAt,desc" });

  if (stats.isError) {
    return (
      <>
        <PageHeader title="Dashboard" description="Live overview of production incidents." />
        <ErrorState message={(stats.error as Error)?.message} onRetry={() => stats.refetch()} />
      </>
    );
  }

  const trendTotal = stats.data?.trend.reduce((sum, point) => sum + point.count, 0);

  return (
    <>
      <PageHeader title="Dashboard" description="Live overview of production incidents." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total incidents"
          value={stats.data?.total}
          loading={stats.isLoading}
          icon={<IconGrid className="h-5 w-5" />}
          accentColor="var(--color-accent-strong)"
          accentBackground="var(--color-accent-soft)"
          hint="All time"
        />
        <StatCard
          label="Open"
          value={stats.data?.open}
          loading={stats.isLoading}
          icon={<IconAlertTriangle className="h-5 w-5" />}
          accentColor={STATUS_META.OPEN.color}
          accentBackground={STATUS_META.OPEN.background}
          hint="Needs attention"
        />
        <StatCard
          label="Critical (P1/P2)"
          value={stats.data?.critical}
          loading={stats.isLoading}
          icon={<IconAlertTriangle className="h-5 w-5" />}
          accentColor="var(--color-sev-p1)"
          accentBackground="var(--color-sev-p1-soft)"
          hint="Active, not closed"
        />
        <StatCard
          label="In Progress"
          value={stats.data?.inProgress}
          loading={stats.isLoading}
          icon={<IconActivity className="h-5 w-5" />}
          accentColor={STATUS_META.IN_PROGRESS.color}
          accentBackground={STATUS_META.IN_PROGRESS.background}
          hint="Being worked"
        />
        <StatCard
          label="Resolved"
          value={stats.data?.resolved}
          loading={stats.isLoading}
          icon={<IconActivity className="h-5 w-5" />}
          accentColor={STATUS_META.RESOLVED.color}
          accentBackground={STATUS_META.RESOLVED.background}
          hint="Awaiting closure"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Incident trend</CardTitle>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {trendTotal !== undefined
                  ? `${trendTotal} incident${trendTotal === 1 ? "" : "s"} opened in the last 14 days`
                  : "Last 14 days"}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <IncidentTrendChart data={stats.data?.trend} loading={stats.isLoading} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System health</CardTitle>
          </CardHeader>
          <CardBody>
            <HealthPanel compact />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent incidents</CardTitle>
            <Link
              to="/incidents"
              className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-strong)]"
            >
              View all
            </Link>
          </CardHeader>
          <CardBody>
            <RecentIncidentsList incidents={recent.data?.content} loading={recent.isLoading} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}