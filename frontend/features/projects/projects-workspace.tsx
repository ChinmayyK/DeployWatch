"use client";

import { FolderPlus, Globe, ArrowRight, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjectMutations, useProjectsQuery } from "@/hooks/use-deploywatch";
import { formatDateTimeFull } from "@/lib/utils";
import type { Environment } from "@/types";

const environments: Environment[] = ["production", "staging", "sandbox"];

const envConfig: Record<Environment, { color: string; dot: string }> = {
  production: { color: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", dot: "bg-rose-500" },
  staging:    { color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500" },
  sandbox:    { color: "bg-sky-50 text-sky-700 ring-1 ring-sky-200", dot: "bg-sky-500" },
};

export function ProjectsWorkspace() {
  const router = useRouter();
  const { data: projects = [], isLoading, error } = useProjectsQuery();
  const { createProject, setActiveProject } = useProjectMutations();
  const [isModalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<Environment>("production");
  const [description, setDescription] = useState("");

  const openProject = (projectId: string) => {
    setActiveProject.mutate(projectId, {
      onSuccess: () => router.push(`/projects/${projectId}/dashboard`),
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProject.mutate(
      { name, environment, description },
      {
        onSuccess: (project) => {
          setName(""); setDescription(""); setEnvironment("production");
          setModalOpen(false);
          router.push(`/projects/${project.id}/dashboard`);
        },
      },
    );
  };

  if (isLoading) return <LoadingState label="Loading projects..." />;
  if (error instanceof Error) return <ErrorState message={error.message} />;

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Separate monitoring workspaces for production, staging, and internal services. Each project has its own APIs, incidents, and alert policies."
        action={
          <Button size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
            <FolderPlus className="h-3.5 w-3.5" />
            New project
          </Button>
        }
      />

      {/* Summary row */}
      {projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Workspaces</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{projects.length}</p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">Active monitoring projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Avg latency alert</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {Math.round(projects.reduce((s, p) => s + p.alertConfig.latencyThresholdMs, 0) / projects.length)}{" "}
                <span className="text-lg font-medium text-[var(--text-muted)]">ms</span>
              </p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">Threshold across all projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Environments</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["production", "staging", "sandbox"] as Environment[]).map((env) => {
                  const cfg = envConfig[env];
                  return (
                    <span key={env} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {env}
                    </span>
                  );
                })}
              </div>
              <p className="mt-2.5 text-xs text-[var(--text-muted)]">First-class environment split</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project cards or empty state */}
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first project to start organizing monitored APIs and alert policies."
          action={
            <Button size="sm" onClick={() => setModalOpen(true)} className="gap-2">
              <FolderPlus className="h-3.5 w-3.5" />
              Create project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const env = project.environment.toLowerCase() as Environment;
            const cfg = envConfig[env] ?? envConfig.sandbox;
            return (
              <Card key={project.id} className="group transition-shadow hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_24px_64px_rgba(13,21,38,0.10)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {env}
                        </span>
                      </div>
                      <h2 className="mt-2.5 text-base font-semibold text-slate-950">{project.name}</h2>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-muted)] line-clamp-2">{project.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openProject(project.id)}
                      disabled={setActiveProject.isPending}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                      title="Open project"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--border)]/60 pt-4">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Latency alert</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{project.alertConfig.latencyThresholdMs} ms</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Updated</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTimeFull(project.updatedAt)}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openProject(project.id)}
                        disabled={setActiveProject.isPending}
                        className="gap-1.5"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create project modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Create project"
        description="Set up a new monitoring workspace with its own APIs, alerts, and incident stream."
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Project name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Payments Production" required />
          </Field>
          <Field label="Environment">
            <Select value={environment} onChange={(e) => setEnvironment(e.target.value as Environment)}>
              {environments.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Critical upstream providers for the payments surface."
              required
            />
          </Field>
          {createProject.error instanceof Error && (
            <ErrorState message={createProject.error.message} />
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
