"use client";

import { ChevronDown, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useProjectMutations } from "@/hooks/use-deploywatch";
import type { ProjectWithAlertConfig } from "@/types";
import { cn } from "@/lib/utils";

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

  const active = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="space-y-1">
      {/* Active project display */}
      <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
          <FolderKanban className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{active?.name ?? "Select project"}</p>
          <p className="text-[10px] capitalize text-[var(--sidebar-muted)]">{active?.environment?.toLowerCase() ?? "—"}</p>
        </div>
      </div>

      {/* Switcher select */}
      <div className="relative">
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
          className={cn(
            "h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/8 pl-3 pr-8 text-xs text-slate-300 outline-none transition",
            "hover:border-white/20 hover:bg-white/12 focus:border-white/25 focus:text-white",
            isPending && "opacity-50 cursor-not-allowed",
          )}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id} className="bg-slate-900 text-white">
              {project.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
      </div>

      {/* New project link */}
      <Link
        href="/projects"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--sidebar-muted)] transition hover:bg-white/6 hover:text-slate-300"
      >
        <Plus className="h-3 w-3" />
        New project
      </Link>
    </div>
  );
}
