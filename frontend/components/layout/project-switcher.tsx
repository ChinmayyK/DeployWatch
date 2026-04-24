"use client";

import { ChevronDown, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useProjectMutations } from "@/hooks/use-deploywatch";
import type { ProjectWithAlertConfig } from "@/types";

export function ProjectSwitcher({
  projects,
  activeProjectId,
}: {
  projects: ProjectWithAlertConfig[];
  activeProjectId?: string;
}) {
  const router = useRouter();
  const { setActiveProject } = useProjectMutations();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-[0_10px_25px_rgba(15,23,42,0.24)]">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Projects</p>
            <p className="text-xs text-[var(--sidebar-muted)]">Switch workspace context</p>
          </div>
        </div>
        <Link
          href="/projects"
          className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-[var(--sidebar-muted)] transition hover:bg-white/10 hover:text-white"
        >
          View all
        </Link>
      </div>
      <div className="relative mt-4">
        <select
          value={activeProjectId ?? ""}
          disabled={isPending}
          onChange={(event) => {
            const projectId = event.target.value;
            startTransition(() => {
              setActiveProject.mutate(projectId, {
                onSuccess: () => router.push(`/projects/${projectId}/dashboard`),
              });
            });
          }}
          className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/15 px-4 pr-10 text-sm text-white outline-none transition focus:border-white/25"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sidebar-muted)]" />
      </div>
      <Button variant="secondary" className="mt-3 w-full justify-center gap-2 border-white/10 bg-white/8 text-white hover:bg-white/12" onClick={() => router.push("/projects")}>
        <Plus className="h-4 w-4" />
        New project
      </Button>
    </div>
  );
}
