"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert, ShieldCheck, Siren } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { useIncidentsQuery, useProjectQuery } from "@/hooks/use-deploywatch";
import { formatDateTimeFull, incidentSeverityTone, incidentStatusTone } from "@/lib/utils";

export function IncidentsOverview({ projectId }: { projectId: string }) {
  const { data: project, isLoading: projectLoading } = useProjectQuery(projectId);
  const { data: incidents = [], isLoading, error } = useIncidentsQuery(projectId);

  if (isLoading || projectLoading) {
    return <LoadingState label="Loading incidents..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  const activeCount = incidents.filter((incident) => incident.status !== "resolved").length;
  const resolvedCount = incidents.filter((incident) => incident.status === "resolved").length;
  const criticalCount = incidents.filter((incident) => incident.severity === "critical").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={project?.name ?? "Project"}
        title="Incidents"
        description="Track outages, degradations, and recoveries with a timeline that stays close to the affected API."
      />

      {incidents.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <Card className="metric-shell">
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Active incidents</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{activeCount}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">Investigating, identified, and monitoring cases still open.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-slate-950 text-white">
                <Siren className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="metric-shell">
            <CardContent className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Critical severity</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{criticalCount}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                High-urgency incidents that likely require direct operator escalation.
              </p>
            </CardContent>
          </Card>
          <Card className="metric-shell">
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Resolved</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{resolvedCount}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  Historical incidents remain available for postmortem and trend analysis.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white text-slate-900 ring-1 ring-[var(--border)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {incidents.length === 0 ? (
        <EmptyState
          title="No incidents recorded"
          description="When monitors detect prolonged failures or major degradations, incidents will show up here with a full timeline."
        />
      ) : (
        <Card>
          <CardHeader title="Incident stream" description="Most recent incidents across this project." />
          <CardContent className="space-y-4">
            {incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/projects/${projectId}/incidents/${incident.id}`}
                className="panel-subtle hairline block rounded-[28px] border border-[var(--border)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white/90"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-[var(--border)]">
                        {incident.severity === "critical" ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-950">{incident.title}</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{incident.summary}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={incidentSeverityTone(incident.severity)}>{incident.severity}</Badge>
                    <Badge className={incidentStatusTone(incident.status)}>{incident.status}</Badge>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Started</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTimeFull(incident.startedAt)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Resolved</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {incident.resolvedAt ? formatDateTimeFull(incident.resolvedAt) : "Still active"}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Timeline events</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{incident.timeline.length}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
