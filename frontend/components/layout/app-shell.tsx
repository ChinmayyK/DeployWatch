"use client";

import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

  const activeProjectId = useMemo(() => {
    const match = pathname.match(/\/projects\/([^/]+)/);
    return match?.[1] ?? session?.activeProjectId ?? projects[0]?.id;
  }, [pathname, projects, session?.activeProjectId]);

  if (!mounted || sessionLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <LoadingState label="Loading workspace shell..." />
      </main>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <LoadingState label="Redirecting to login..." />
      </main>
    );
  }

  if (projectsLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <LoadingState label="Loading projects..." />
      </main>
    );
  }

  const activeProject = projects.find((project) => project.id === activeProjectId);

  return (
    <div className="flex min-h-screen">
      {/* ── Mobile backdrop ── */}
      {navOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "sidebar-glow fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col bg-[var(--sidebar)] transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-[var(--sidebar-border)] px-5 py-5">
          <Link href="/projects" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 group-hover:bg-white/15 transition">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <circle cx="10" cy="10" r="3" fill="white" />
                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="10" cy="10" r="10" stroke="white" strokeWidth="0.75" strokeOpacity="0.15" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--sidebar-muted)]">{APP_NAME}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sidebar-muted)] transition hover:bg-white/8 hover:text-white lg:hidden"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Project switcher */}
        {projects.length > 0 && (
          <div className="border-b border-[var(--sidebar-border)] px-3 py-3">
            <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />
          </div>
        )}

        {/* Workspace signal */}
        <div className="border-b border-[var(--sidebar-border)] px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--sidebar-muted)]">Signal</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Projects", value: String(projects.length) },
              { label: "Env", value: activeProject?.environment?.toLowerCase() ?? "—" },
              { label: "User", value: session.name.split(" ")[0] },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/6">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-white capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--sidebar-muted)]">Navigation</p>
          <div className="space-y-0.5">
            {primaryNavigation.map((item) => {
              const href = activeProjectId ? item.href(activeProjectId) : "/projects";
              const active = pathname === href || pathname.startsWith(`${href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={href}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-white text-slate-950 shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                      : "text-slate-300 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", active ? "text-slate-700" : "text-slate-400 group-hover:text-slate-200")} />
                  {item.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-950/30" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-[var(--sidebar-border)] px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/6">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-semibold text-white shadow-inner">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{session.name}</p>
              <p className="truncate text-xs text-[var(--sidebar-muted)]">{session.email}</p>
            </div>
            <button
              type="button"
              title="Sign out"
              onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/login") })}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--sidebar-muted)] transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/60 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{APP_NAME}</p>
          <div className="flex items-center gap-2">
            <span className="status-ping h-2 w-2 rounded-full text-emerald-500" />
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden border-b border-white/60 bg-white/60 px-8 py-4 backdrop-blur-md lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
              {activeProject?.environment?.toLowerCase() ?? "workspace"}
            </p>
            <p className="mt-0.5 text-base font-semibold tracking-tight text-slate-900">
              {activeProject?.name ?? "DeployWatch workspace"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-3.5 py-1.5 text-xs font-medium">
              <div className="relative flex">
                <span className="status-ping h-2 w-2 rounded-full text-emerald-500" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              Live
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-subtle)]">
              Realtime posture
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="animate-surface-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
