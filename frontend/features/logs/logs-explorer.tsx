"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useApisQuery, useLogsQuery, useProjectQuery } from "@/hooks/use-deploywatch";
import { formatDateTimeFull, formatLatency } from "@/lib/utils";
import type { LogsFilter } from "@/types";

export function LogsExplorer({ projectId }: { projectId: string }) {
  const [filter, setFilter] = useState<LogsFilter>({ range: "24h", outcome: "all" });
  const { data: project, isLoading: projectLoading } = useProjectQuery(projectId);
  const { data: apis = [] } = useApisQuery(projectId);
  const { data: logs = [], isLoading, error } = useLogsQuery(projectId, filter);

  if (isLoading || projectLoading) {
    return <LoadingState label="Loading request logs..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  const failures = logs.filter((log) => log.outcome === "failure").length;
  const successes = logs.length - failures;
  const averageLatency = logs.length
    ? Math.round(logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length)
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={project?.name ?? "Project"}
        title="Logs explorer"
        description="Inspect individual request checks, filter down by time window and outcome, and understand why monitors changed state."
      />

      <Card>
        <CardHeader title="Filters" description="Narrow logs to the timeframe and outcome you want to inspect." />
        <CardContent className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Time range">
              <Select
                value={filter.range}
                onChange={(event) => setFilter((current) => ({ ...current, range: event.target.value as LogsFilter["range"] }))}
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </Select>
            </Field>
            <Field label="Outcome">
              <Select
                value={filter.outcome}
                onChange={(event) =>
                  setFilter((current) => ({ ...current, outcome: event.target.value as LogsFilter["outcome"] }))
                }
              >
                <option value="all">All checks</option>
                <option value="success">Successful checks</option>
                <option value="failure">Failed checks</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Matches</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{logs.length}</p>
            </div>
            <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Failures</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{failures}</p>
            </div>
            <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Average latency</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{formatLatency(averageLatency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 ? (
        <Card>
          <CardContent className="grid gap-5 p-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Query posture</p>
              <h2 className="mt-4 text-[2.2rem] font-semibold tracking-[-0.05em] text-slate-950">
                {failures === 0 ? "No failures were returned for this query window." : `${failures} failures require inspection.`}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                Use the filtered request stream to isolate regressions, verify recoveries, and compare monitor behavior across recent windows.
              </p>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              <Badge className="bg-emerald-500/12 text-emerald-700 ring-emerald-600/20">{successes} success</Badge>
              <Badge className="bg-rose-500/12 text-rose-700 ring-rose-600/20">{failures} failure</Badge>
              <Badge className="bg-slate-500/10 text-slate-600 ring-slate-500/20">{filter.range}</Badge>
              <Badge className="bg-sky-500/12 text-sky-700 ring-sky-600/20">
                {filter.outcome === "all" ? "all outcomes" : filter.outcome}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {logs.length === 0 ? (
        <EmptyState
          title="No logs for this filter"
          description="Try widening the time range or switching back to all outcomes."
        />
      ) : (
        <Card>
          <CardHeader title="Request logs" description={`${logs.length} checks matched the current filter.`} />
          <CardContent className="overflow-x-auto p-0">
            <table className="table-shell min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--surface-muted)]/80">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3 font-medium">API</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Latency</th>
                  <th className="px-5 py-3 font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs.map((log) => (
                  <tr key={log.id} className="text-sm transition hover:bg-white/60">
                    <td className="px-5 py-4 text-slate-900">{formatDateTimeFull(log.timestamp)}</td>
                    <td className="px-5 py-4 text-slate-900">
                      <div>
                        <p className="font-medium text-slate-950">{apis.find((api) => api.id === log.apiId)?.name ?? log.apiId}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{log.apiId}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        className={
                          log.outcome === "success"
                            ? "bg-emerald-500/12 text-emerald-700 ring-emerald-600/20"
                            : "bg-rose-500/12 text-rose-700 ring-rose-600/20"
                        }
                      >
                        {log.statusCode}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-900">{log.latencyMs} ms</td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">{log.errorMessage ?? "Healthy response"}</td>
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
