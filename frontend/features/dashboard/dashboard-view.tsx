"use client";

import Link from "next/link";
import { Activity, AlertTriangle, Clock3, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { useDashboardQuery } from "@/hooks/use-deploywatch";
import { formatLatency, formatPercent, formatRelativeTime, formatTimestamp, statusTone } from "@/lib/utils";

function OverviewCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{value}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{hint}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,0.16)]">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardView({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useDashboardQuery(projectId);

  if (isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  if (!data) {
    return <ErrorState message="Dashboard data is unavailable." />;
  }

  const operationalCount = data.apis.filter((api) => api.health.status === "operational").length;
  const degradedCount = data.apis.filter((api) => api.health.status === "degraded").length;
  const downCount = data.apis.filter((api) => api.health.status === "down").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={data.project.environment}
        title={data.project.name}
        description={data.project.description}
        action={
          <Link href={`/projects/${projectId}/apis`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add API
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Operational posture</p>
            <h2 className="mt-4 text-[2.3rem] font-semibold tracking-[-0.05em] text-slate-950">
              {operationalCount === data.apis.length
                ? "All monitored APIs are healthy."
                : `${operationalCount} of ${data.apis.length} monitors are fully healthy.`}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              DeployWatch keeps a tight read on uptime, response time, and incident posture so operators can see whether a dependency problem is noisy or structurally real.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ["Operational", operationalCount, "bg-emerald-500"],
              ["Degraded", degradedCount, "bg-amber-500"],
              ["Down", downCount, "bg-rose-500"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="font-mono text-sm text-slate-900">{value}</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div
                    className={`h-2 rounded-full ${tone}`}
                    style={{ width: `${data.apis.length === 0 ? 0 : (Number(value) / data.apis.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <OverviewCard
          label="Uptime"
          value={formatPercent(data.overview.uptimePercentage)}
          hint="Average uptime across active monitors"
          icon={<Activity className="h-5 w-5" />}
        />
        <OverviewCard
          label="Average latency"
          value={formatLatency(data.overview.averageLatencyMs)}
          hint="Mean latency from successful checks"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <OverviewCard
          label="Active incidents"
          value={String(data.overview.activeIncidents)}
          hint="Incidents currently under investigation or monitoring"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {data.apis.length === 0 ? (
        <EmptyState
          title="No APIs configured"
          description="Add your first API monitor to start collecting status checks, latency snapshots, and incident context."
          action={
            <Link href={`/projects/${projectId}/apis`}>
              <Button>Add API monitor</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader title="API health" description="Live operational snapshots for every monitor in this project." />
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--surface-muted)]">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">API</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Latency</th>
                  <th className="px-5 py-3 font-medium">Uptime</th>
                  <th className="px-5 py-3 font-medium">Last checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.apis.map((api) => (
                  <tr key={api.id} className="text-sm text-slate-900 transition hover:bg-white/60">
                    <td className="px-5 py-4">
                      <Link href={`/projects/${projectId}/apis/${api.id}`} className="group block">
                        <p className="font-semibold text-slate-950 transition group-hover:text-slate-700">{api.name}</p>
                        <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                          {api.method} {api.url}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={statusTone(api.health.status)}>{api.health.status}</Badge>
                    </td>
                    <td className="px-5 py-4 font-mono">{formatLatency(api.health.latestLatencyMs)}</td>
                    <td className="px-5 py-4">{formatPercent(api.health.uptimePercentage)}</td>
                    <td className="px-5 py-4">
                      <p>{formatTimestamp(api.health.lastCheckedAt)}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{formatRelativeTime(api.health.lastCheckedAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
