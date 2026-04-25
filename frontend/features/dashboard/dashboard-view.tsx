"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, Clock3, Plus, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { useDashboardQuery } from "@/hooks/use-deploywatch";
import { formatLatency, formatPercent, formatRelativeTime, formatTimestamp, statusTone } from "@/lib/utils";
import { Globe } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{label}</p>
            <p className={`mt-3 text-3xl font-semibold tracking-tight ${accent ? "text-emerald-600" : "text-slate-950"}`}>
              {value}
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{sub}</p>
          </div>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    down: "bg-rose-500",
    paused: "bg-slate-400",
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status] ?? "bg-slate-400"}`} />
  );
}

export function DashboardView({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useDashboardQuery(projectId);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;
  if (error instanceof Error) return <ErrorState message={error.message} />;
  if (!data) return <ErrorState message="Dashboard data is unavailable." />;

  const operationalCount = data.apis.filter((a) => a.health.status === "operational").length;
  const degradedCount = data.apis.filter((a) => a.health.status === "degraded").length;
  const downCount = data.apis.filter((a) => a.health.status === "down").length;
  const allHealthy = operationalCount === data.apis.length;

  return (
    <div className="space-y-6 animate-slide-up stagger-children">
      {/* Page header */}
      <PageHeader
        eyebrow={data.project.environment}
        title={data.project.name}
        description={data.project.description ?? "Monitor APIs, track incidents, and view latency trends for this project."}
        action={
          <Link href={`/projects/${projectId}/apis`}>
            <Button size="sm" className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add API
            </Button>
          </Link>
        }
      />

      {/* Posture banner */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${allHealthy ? "bg-emerald-50 text-emerald-500 ring-1 ring-emerald-200" : downCount > 0 ? "bg-rose-50 text-rose-500 ring-1 ring-rose-200" : "bg-amber-50 text-amber-500 ring-1 ring-amber-200"}`}>
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {data.apis.length === 0
                    ? "No APIs configured yet"
                    : allHealthy
                      ? "All systems operational"
                      : `${operationalCount} of ${data.apis.length} APIs healthy`}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {data.apis.length === 0
                    ? "Add your first API monitor to start collecting data."
                    : `${degradedCount} degraded · ${downCount} down`}
                </p>
              </div>
            </div>

            {/* Status breakdown mini-bars */}
            {data.apis.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                {[
                  { label: "Operational", count: operationalCount, color: "bg-emerald-500" },
                  { label: "Degraded", count: degradedCount, color: "bg-amber-500" },
                  { label: "Down", count: downCount, color: "bg-rose-500" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    <span>{count} {label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Uptime"
          value={formatPercent(data.overview.uptimePercentage)}
          sub="Across all monitors (24h)"
          icon={TrendingUp}
          accent={data.overview.uptimePercentage >= 99}
        />
        <StatCard
          label="Avg latency"
          value={formatLatency(data.overview.averageLatencyMs)}
          sub="Mean from successful checks"
          icon={Clock3}
        />
        <StatCard
          label="Active incidents"
          value={String(data.overview.activeIncidents)}
          sub="Currently open or under monitoring"
          icon={AlertTriangle}
        />
      </div>

      {/* API table or empty state */}
      {data.apis.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No APIs configured"
          description="Add your first API monitor to start collecting status checks, latency snapshots, and incident context."
          action={
            <Link href={`/projects/${projectId}/apis`}>
              <Button size="sm">Add API monitor</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader
            title="API health"
            description="Live operational snapshot for every monitor in this project"
            action={
              <Link href={`/projects/${projectId}/apis`}>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  Manage
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]/70 bg-[var(--surface-muted)]/60">
                    <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">API</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Status</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Latency</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Uptime</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Last check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/50">
                  {data.apis.map((api) => (
                    <tr key={api.id} className="group transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <Link href={`/projects/${projectId}/apis/${api.id}`} className="block">
                          <p className="font-medium text-slate-900 group-hover:text-slate-700">{api.name}</p>
                          <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
                            {api.method} {api.url}
                          </p>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={statusTone(api.health.status)}>
                          <StatusDot status={api.health.status} />
                          {api.health.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-slate-700">
                        {formatLatency(api.health.latestLatencyMs)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatPercent(api.health.uptimePercentage)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">{formatTimestamp(api.health.lastCheckedAt)}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{formatRelativeTime(api.health.lastCheckedAt)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
