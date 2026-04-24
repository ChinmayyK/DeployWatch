"use client";

import { Activity, Clock3, ShieldCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { useApiDetailQuery } from "@/hooks/use-deploywatch";
import {
  formatDateTimeFull,
  formatLatency,
  formatPercent,
  statusLabelFromLog,
  statusTone,
} from "@/lib/utils";

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="metric-shell">
      <CardContent className="p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
        <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function ApiDetailView({ projectId, apiId }: { projectId: string; apiId: string }) {
  const { data, isLoading, error } = useApiDetailQuery(projectId, apiId);

  if (isLoading) {
    return <LoadingState label="Loading API detail..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  if (!data) {
    return <ErrorState message="API details are unavailable." />;
  }

  const totalChecks = data.api.health.failedChecks + data.api.health.successfulChecks;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={data.api.method}
        title={data.api.name}
        description={data.api.url}
        action={<Badge className={statusTone(data.api.health.status)}>{data.api.health.status}</Badge>}
      />

      <div className="grid gap-5 xl:grid-cols-4">
        <Metric
          label="Uptime"
          value={formatPercent(data.api.health.uptimePercentage)}
          hint="Successful checks in the retained monitoring window."
        />
        <Metric
          label="Average latency"
          value={formatLatency(data.api.health.averageLatencyMs)}
          hint="Average response time across healthy checks."
        />
        <Metric
          label="Latest response"
          value={formatLatency(data.api.health.latestLatencyMs)}
          hint={`Last checked ${data.api.health.lastCheckedAt ? formatDateTimeFull(data.api.health.lastCheckedAt) : "never"}.`}
        />
        <Metric
          label="Cadence"
          value={`Every ${data.api.intervalMinutes}m`}
          hint={data.api.enabled ? "Monitoring is currently enabled." : "Monitoring is currently paused."}
        />
      </div>

      <Card>
        <CardContent className="grid gap-5 p-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Monitor brief</p>
            <h2 className="mt-4 text-[2.2rem] font-semibold tracking-[-0.05em] text-slate-950">
              {data.api.health.status === "operational"
                ? "Responses are stable and within expected range."
                : "Recent checks show elevated risk on this upstream dependency."}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              The detail view combines live response timing, historical outcomes, and request configuration so operators can decide whether a regression is transient or persistent.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="panel-subtle hairline rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-slate-950 text-white">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{totalChecks} retained checks</p>
                  <p className="text-sm text-[var(--text-muted)]">Historical window represented in this view</p>
                </div>
              </div>
            </div>
            <div className="panel-subtle hairline rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-white text-slate-900 ring-1 ring-[var(--border)]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {data.api.health.lastStatusCode ? `HTTP ${data.api.health.lastStatusCode}` : "No recent code"}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Most recent observed status code</p>
                </div>
              </div>
            </div>
            <div className="panel-subtle hairline rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-white text-slate-900 ring-1 ring-[var(--border)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{data.api.health.failedChecks} failed checks</p>
                  <p className="text-sm text-[var(--text-muted)]">Included in the current monitoring window</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Latency history"
          description="Recent check durations across the latest monitoring window."
          action={
            <div className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
              {data.latencySeries.length} samples
            </div>
          }
        />
        <CardContent className="h-[320px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.latencySeries}>
              <defs>
                <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) =>
                  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value))
                }
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value: number) => `${value} ms`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 20,
                  borderColor: "#d7dde7",
                  backgroundColor: "rgba(255,255,255,0.96)",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                }}
                labelFormatter={(value) => formatDateTimeFull(String(value))}
                formatter={(value) => [`${String(value ?? 0)} ms`, "Latency"]}
              />
              <Area type="monotone" dataKey="latencyMs" stroke="#2563eb" strokeWidth={2} fill="url(#latencyFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader title="Status history" description="Latest check outcomes in reverse chronological order." />
          <CardContent className="space-y-3">
            {data.statusHistory.map((log) => (
              <div
                key={log.id}
                className="panel-subtle hairline flex items-center justify-between rounded-[24px] border border-[var(--border)] px-4 py-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${log.outcome === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                    <p className="text-sm font-semibold text-slate-900">{statusLabelFromLog(log)}</p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTimeFull(log.timestamp)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-slate-900">{log.statusCode}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{log.latencyMs} ms</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Request shape" description="Current configuration for this monitor." />
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Method</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{data.api.method}</p>
              </div>
              <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Endpoint</p>
                <p className="mt-2 truncate text-sm font-semibold text-slate-950">{data.api.url}</p>
              </div>
              <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">State</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{data.api.enabled ? "Enabled" : "Paused"}</p>
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Headers</p>
              <div className="panel-subtle hairline mt-2 rounded-[24px] border border-[var(--border)] p-4">
                {data.api.headers.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No custom headers configured.</p>
                ) : (
                  <div className="space-y-2 font-mono text-xs text-slate-900">
                    {data.api.headers.map((header) => (
                      <div key={header.id}>
                        {header.key}: {header.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Body</p>
              <div className="panel-subtle hairline mt-2 rounded-[24px] border border-[var(--border)] p-4">
                {data.api.body ? (
                  <pre className="overflow-x-auto font-mono text-xs leading-6 text-slate-900">{data.api.body}</pre>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No request body configured.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent request logs" description="Latest checks recorded for this monitor." />
        <CardContent className="overflow-x-auto p-0">
          <table className="table-shell min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--surface-muted)]/80">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Status code</th>
                <th className="px-5 py-3 font-medium">Latency</th>
                <th className="px-5 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.recentLogs.map((log) => (
                <tr key={log.id} className="text-sm transition hover:bg-white/60">
                  <td className="px-5 py-4 text-slate-900">{formatDateTimeFull(log.timestamp)}</td>
                  <td className="px-5 py-4 font-mono text-slate-900">{log.statusCode}</td>
                  <td className="px-5 py-4 font-mono text-slate-900">{log.latencyMs} ms</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{log.errorMessage ?? "Healthy response"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
