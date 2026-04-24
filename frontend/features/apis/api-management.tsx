"use client";

import Link from "next/link";
import { Activity, Pencil, Plus, TimerReset, Trash2 } from "lucide-react";
import { useState } from "react";

import { ApiFormModal } from "@/features/apis/api-form-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { useApiMutations, useApisQuery, useProjectQuery } from "@/hooks/use-deploywatch";
import { formatLatency, formatPercent, formatRelativeTime, formatTimestamp, statusTone } from "@/lib/utils";
import type { ApiInput, ApiListItem } from "@/types";

export function ApiManagement({ projectId }: { projectId: string }) {
  const { data: project, isLoading: projectLoading } = useProjectQuery(projectId);
  const { data: apis = [], isLoading, error } = useApisQuery(projectId);
  const { createApi, updateApi, deleteApi, toggleApi } = useApiMutations(projectId);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiListItem | undefined>();

  const closeModal = () => {
    setEditingApi(undefined);
    setModalOpen(false);
  };

  const enabledCount = apis.filter((api) => api.enabled).length;
  const healthyCount = apis.filter((api) => api.health.status === "operational").length;
  const averageInterval = apis.length
    ? Math.round(apis.reduce((sum, api) => sum + api.intervalMinutes, 0) / apis.length)
    : 0;

  const submit = (input: ApiInput) => {
    if (editingApi) {
      updateApi.mutate(
        { apiId: editingApi.id, input },
        {
          onSuccess: closeModal,
        },
      );
      return;
    }

    createApi.mutate(input, {
      onSuccess: closeModal,
    });
  };

  if (isLoading || projectLoading) {
    return <LoadingState label="Loading API monitors..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={project?.name ?? "Project"}
        title="API management"
        description="Add and maintain monitoring definitions for each external dependency. Request configuration lives here while health and incidents flow into the rest of the product."
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEditingApi(undefined);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add API
          </Button>
        }
      />

      {apis.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <Card className="metric-shell">
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Monitors</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{apis.length}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  {enabledCount} active and checking upstream dependencies on a recurring cadence.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,0.16)]">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="metric-shell">
            <CardContent className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Coverage</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                {apis.length === 0 ? "0%" : formatPercent((healthyCount / apis.length) * 100)}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                {healthyCount} of {apis.length} monitors are currently reporting an operational state.
              </p>
            </CardContent>
          </Card>
          <Card className="metric-shell">
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Average cadence</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                  {averageInterval}
                  <span className="ml-1 text-lg font-medium text-[var(--text-muted)]">min</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  Monitoring intervals stay visible here so teams can balance cost, speed, and signal quality.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white text-slate-900 ring-1 ring-[var(--border)]">
                <TimerReset className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {apis.length === 0 ? (
        <EmptyState
          title="No API monitors configured"
          description="Create your first monitor to begin collecting availability, latency, and request logs."
          action={
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add API
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader
            title="Configured monitors"
            description="Each monitor tracks a concrete endpoint, request shape, and response profile."
          />
          <CardContent className="overflow-x-auto p-0">
            <table className="table-shell min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--surface-muted)]/80">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">API</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Latency</th>
                  <th className="px-5 py-3 font-medium">Uptime</th>
                  <th className="px-5 py-3 font-medium">Monitoring</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {apis.map((api) => (
                  <tr key={api.id} className="align-top text-sm text-slate-900 transition hover:bg-white/65">
                    <td className="px-5 py-4">
                      <Link href={`/projects/${projectId}/apis/${api.id}`} className="group block">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900 transition group-hover:text-slate-700">{api.name}</p>
                          <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                            {api.method}
                          </span>
                        </div>
                        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">{api.url}</p>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          Every {api.intervalMinutes} minute{api.intervalMinutes > 1 ? "s" : ""} • Last checked{" "}
                          {formatRelativeTime(api.health.lastCheckedAt)}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={statusTone(api.health.status)}>{api.health.status}</Badge>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <p className="font-semibold text-slate-950">{formatLatency(api.health.latestLatencyMs)}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{formatTimestamp(api.health.lastCheckedAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{formatPercent(api.health.uptimePercentage)}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {api.health.successfulChecks} successful checks
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={api.enabled}
                          onCheckedChange={(enabled) => toggleApi.mutate({ apiId: api.id, enabled })}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{api.enabled ? "Enabled" : "Paused"}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {api.enabled ? "Checks continue on schedule" : "No new checks will be sent"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="gap-2"
                          onClick={() => {
                            setEditingApi(api);
                            setModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="danger" className="gap-2" onClick={() => deleteApi.mutate(api.id)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <ApiFormModal
        open={isModalOpen}
        api={editingApi}
        pending={createApi.isPending || updateApi.isPending}
        error={
          createApi.error instanceof Error
            ? createApi.error.message
            : updateApi.error instanceof Error
              ? updateApi.error.message
              : undefined
        }
        onClose={closeModal}
        onSubmit={submit}
      />
    </div>
  );
}
