"use client";

import { LogOut, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { APP_NAME } from "@/config/constants";
import { primaryNavigation } from "@/config/navigation";
import { useAuthMutations, useProjectsQuery, useSessionQuery } from "@/hooks/use-deploywatch";
import { cn } from "@/lib/utils";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isLoading: sessionLoading } = useSessionQuery();
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const { logout } = useAuthMutations();
  const [navOpen, setNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !sessionLoading && !session) {
      window.location.href = "/login";
    }
  }, [mounted, session, sessionLoading]);

  const activeProjectId = useMemo(() => {
    const match = pathname.match(/\/projects\/([^/]+)/);
    return match?.[1] ?? session?.activeProjectId ?? projects[0]?.id;
  }, [pathname, projects, session?.activeProjectId]);

  if (!mounted || sessionLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10">
        <LoadingState label="Loading workspace shell..." />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10">
        <div className="w-full text-center">
          <LoadingState label="Redirecting to login..." />
          <p className="mt-4 text-sm text-slate-500">
            If you are not redirected, <Link href="/login" className="text-blue-600 underline font-medium">click here</Link>.
          </p>
        </div>
      </main>
    );
  }

  if (projectsLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10">
        <LoadingState label="Loading projects..." />
      </main>
    );
  }

  const activeProject = projects.find((project) => project.id === activeProjectId);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1680px] gap-5 px-4 py-4 lg:px-6 lg:py-5">
        <aside
          className={cn(
            "fixed inset-x-4 top-4 z-30 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-4 text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)] transition lg:static lg:w-[320px]",
            navOpen ? "translate-y-0 opacity-100" : "-translate-y-[120%] opacity-0 lg:translate-y-0 lg:opacity-100",
          )}
        >
          <div className="flex items-start justify-between">
            <Link href="/projects" className="block">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-400">{APP_NAME}</p>
              <h2 className="mt-3 max-w-[14rem] text-xl font-semibold tracking-tight text-white">
                Operational visibility for every external dependency.
              </h2>
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">Workspace signal</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Projects</p>
                <p className="mt-2 text-2xl font-semibold text-white">{projects.length}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Env</p>
                <p className="mt-2 text-sm font-semibold uppercase text-white">{activeProject?.environment ?? "n/a"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">User</p>
                <p className="mt-2 truncate text-sm font-semibold text-white">{session.name}</p>
              </div>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="mt-5">
              <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />
            </div>
          ) : null}

          <nav className="mt-6 space-y-1.5">
            {primaryNavigation.map((item) => {
              const href = activeProjectId ? item.href(activeProjectId) : "/projects";
              const active = pathname === href || pathname.startsWith(`${href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition",
                    active
                      ? "bg-white text-slate-950 shadow-[0_18px_35px_rgba(15,23,42,0.18)]"
                      : "text-slate-300 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/15 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">Signed in</p>
            <p className="mt-3 text-sm font-semibold text-white">{session.name}</p>
            <p className="mt-1 text-sm text-slate-400">{session.email}</p>
            <Button
              variant="ghost"
              className="mt-4 w-full justify-start gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white"
              onClick={() =>
                logout.mutate(undefined, {
                  onSuccess: () => router.replace("/login"),
                })
              }
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="surface-glow mb-4 flex items-center justify-between rounded-[26px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,252,0.92)_100%)] px-4 py-3 lg:hidden">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{APP_NAME}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{activeProject?.name ?? "Workspace"}</p>
            </div>
            <Button variant="secondary" onClick={() => setNavOpen(true)}>
              Menu
            </Button>
          </div>
          <div className="surface-glow mb-5 hidden items-center justify-between rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,249,252,0.94)_100%)] px-6 py-4 lg:flex">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--text-muted)]">
                {activeProject?.environment ?? "workspace"}
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                {activeProject?.name ?? "DeployWatch workspace"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live workspace
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.18em]">Realtime posture</span>
            </div>
          </div>
          <main className="surface-glow min-w-0 rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(245,248,252,0.92)_100%)] p-5 md:p-7">
            <div className="animate-surface-enter">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
