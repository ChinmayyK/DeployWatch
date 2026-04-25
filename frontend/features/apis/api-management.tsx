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
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow={project?.name ?? "Project"}
        title="API management"
        description="Add and maintain monitoring definitions for each external dependency. Request configuration lives here while health and incidents flow into the rest of the product."
        action={
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingApi(undefined);
              setModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add API
          </Button>
        }
      />

      {apis.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Monitors</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{apis.length}</p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{enabledCount} active · checking upstream</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Coverage</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">
                {apis.length === 0 ? "0%" : formatPercent((healthyCount / apis.length) * 100)}
              </p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{healthyCount} of {apis.length} operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Avg cadence</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {averageInterval}<span className="ml-1 text-base font-medium text-[var(--text-muted)]">min</span>
              </p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">Polling interval average</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {apis.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No API monitors configured"
          description="Create your first monitor to begin collecting availability, latency, and request logs."
          action={
            <Button size="sm" onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="h-3.5 w-3.5" />
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
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[var(--border)]/70 bg-[var(--surface-muted)]/50 text-left">
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">API</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Status</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Latency</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Uptime</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Monitoring</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {apis.map((api) => (
                  <tr key={api.id} className="group align-top text-sm transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <Link href={`/projects/${projectId}/apis/${api.id}`} className="group/link block">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900 group-hover/link:text-slate-700">{api.name}</p>
                          <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-600">
                            {api.method}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">{api.url}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={statusTone(api.health.status)}>{api.health.status}</Badge>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-slate-700">
                      {formatLatency(api.health.latestLatencyMs)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {formatPercent(api.health.uptimePercentage)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Switch
                          checked={api.enabled}
                          onCheckedChange={(enabled) => toggleApi.mutate({ apiId: api.id, enabled })}
                        />
                        <p className="text-xs text-[var(--text-muted)]">{api.enabled ? "Active" : "Paused"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => { setEditingApi(api); setModalOpen(true); }}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" className="gap-1.5" onClick={() => deleteApi.mutate(api.id)}>
                          <Trash2 className="h-3 w-3" />
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
