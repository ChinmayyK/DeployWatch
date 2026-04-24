"use client";

import { FolderPlus, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
          setName("");
          setDescription("");
          setEnvironment("production");
          setModalOpen(false);
          router.push(`/projects/${project.id}/dashboard`);
        },
      },
    );
  };

  if (isLoading) {
    return <LoadingState label="Loading projects..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Create distinct monitoring workspaces for production, staging, and internal services. Each project owns its APIs, incidents, alerts, and logs."
        action={
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <FolderPlus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      {projects.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Workspaces</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{projects.length}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                Separate projects keep operational context clean across production, staging, and internal dependencies.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Average latency threshold</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                {Math.round(
                  projects.reduce((sum, project) => sum + project.alertConfig.latencyThresholdMs, 0) / projects.length,
                )}{" "}
                <span className="text-lg font-medium text-[var(--text-muted)]">ms</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                Alert policies stay visible at the workspace level so teams can reason about signal quality before incidents start.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Operator intent</p>
              <div className="mt-4 flex gap-2">
                {["production", "staging", "sandbox"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
                Environment split is first-class, so the workspace list feels like a portfolio of dependencies rather than a flat project menu.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing monitored APIs and alert policies."
          action={
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <FolderPlus className="h-4 w-4" />
              Create project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader
                title={project.name}
                description={project.description}
                action={
                  <Button variant="secondary" className="gap-2" onClick={() => openProject(project.id)}>
                    <Rocket className="h-4 w-4" />
                    Open project
                  </Button>
                }
              />
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Environment</p>
                  <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{project.environment}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Latency alert</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{project.alertConfig.latencyThresholdMs} ms</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Updated</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{formatDateTimeFull(project.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Create project"
        description="Set up a new monitoring workspace with its own APIs, alerts, and incident stream."
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Project name">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Payments Production" required />
          </Field>
          <Field label="Environment">
            <Select value={environment} onChange={(event) => setEnvironment(event.target.value as Environment)}>
              {environments.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Critical upstream providers for the payments surface."
              required
            />
          </Field>
          {createProject.error instanceof Error ? <ErrorState message={createProject.error.message} /> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
