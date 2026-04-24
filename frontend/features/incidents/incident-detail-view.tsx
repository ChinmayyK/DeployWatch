"use client";

import { AlertTriangle, ShieldCheck, Siren } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { useApisQuery, useIncidentQuery } from "@/hooks/use-deploywatch";
import { formatDateTimeFull, incidentSeverityTone, incidentStatusTone } from "@/lib/utils";

export function IncidentDetailView({
  projectId,
  incidentId,
}: {
  projectId: string;
  incidentId: string;
}) {
  const { data, isLoading, error } = useIncidentQuery(projectId, incidentId);
  const { data: apis = [] } = useApisQuery(projectId);

  const apiName = apis.find((api) => api.id === data?.apiId)?.name ?? data?.apiId ?? "Unknown API";

  if (isLoading) {
    return <LoadingState label="Loading incident..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  if (!data) {
    return <ErrorState message="Incident details are unavailable." />;
  }

  const timelineStatusCount = data.timeline.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Incident"
        title={data.title}
        description={data.summary}
        action={
          <div className="flex gap-2">
            <Badge className={incidentSeverityTone(data.severity)}>{data.severity}</Badge>
            <Badge className={incidentStatusTone(data.status)}>{data.status}</Badge>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="metric-shell">
          <CardContent className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Started</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{formatDateTimeFull(data.startedAt)}</p>
          </CardContent>
        </Card>
        <Card className="metric-shell">
          <CardContent className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Resolved</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">
              {data.resolvedAt ? formatDateTimeFull(data.resolvedAt) : "Still active"}
            </p>
          </CardContent>
        </Card>
        <Card className="metric-shell">
          <CardContent className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Affected monitor</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{apiName}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-5 p-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Incident brief</p>
            <h2 className="mt-4 text-[2.2rem] font-semibold tracking-[-0.05em] text-slate-950">
              {data.status === "resolved"
                ? "The incident has been closed and is available for review."
                : "This incident still requires active operational attention."}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              Timeline entries below capture how the case progressed from first detection through mitigation, recovery, and verification.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="panel-subtle hairline rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-slate-950 text-white">
                  <Siren className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{timelineStatusCount} timeline events</p>
                  <p className="text-sm text-[var(--text-muted)]">Operator-visible state transitions and notes</p>
                </div>
              </div>
            </div>
            <div className="panel-subtle hairline rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-white text-slate-900 ring-1 ring-[var(--border)]">
                  {data.status === "resolved" ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 capitalize">{data.status}</p>
                  <p className="text-sm text-[var(--text-muted)]">Current lifecycle state for this incident</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Timeline" description="Operational updates recorded throughout the incident lifecycle." />
        <CardContent className="space-y-6">
          {data.timeline.map((entry, index) => (
            <div key={entry.id} className="relative pl-8">
              {index < data.timeline.length - 1 ? (
                <span className="absolute left-[11px] top-8 h-[calc(100%+16px)] w-px bg-[linear-gradient(180deg,#cbd5e1_0%,#e2e8f0_100%)]" />
              ) : null}
              <span className="absolute left-0 top-1.5 h-6 w-6 rounded-full border border-slate-300 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.08)]" />
              <div className="panel-subtle hairline rounded-[24px] border border-[var(--border)] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Badge className={incidentStatusTone(entry.status)}>{entry.status}</Badge>
                  <p className="text-sm text-[var(--text-muted)]">{formatDateTimeFull(entry.at)}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-900">{entry.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
