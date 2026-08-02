import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { IncidentTrendPoint } from "@/types/api";
import { Skeleton } from "@/components/ui/Skeleton";

interface IncidentTrendChartProps {
  data: IncidentTrendPoint[] | undefined;
  loading?: boolean;
}

function formatTick(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function IncidentTrendChart({ data, loading }: IncidentTrendChartProps) {
  if (loading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const maxCount = Math.max(1, ...data.map((point) => point.count));
  const tickStep = Math.max(1, Math.ceil(maxCount / 5));
  const yTicks = [];
  for (let tick = 0; tick <= maxCount; tick += tickStep) {
    yTicks.push(tick);
  }
  if (yTicks[yTicks.length - 1] !== maxCount) yTicks.push(maxCount);

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
          interval={Math.max(0, Math.floor(data.length / 7) - 1)}
        />
        <YAxis
          allowDecimals={false}
          domain={[0, maxCount]}
          ticks={yTicks}
          tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-border)", strokeDasharray: "3 3" }}
          contentStyle={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--color-text-primary)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "var(--color-text-muted)", marginBottom: 2 }}
          labelFormatter={(value) => formatTick(String(value))}
          formatter={(value) => [value, "Incidents"]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="url(#trendFill)"
          activeDot={{ r: 4, stroke: "var(--color-surface-1)", strokeWidth: 2, fill: "var(--color-accent)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}