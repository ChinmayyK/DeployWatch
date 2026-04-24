import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">DeployWatch</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          The page you requested does not exist or is no longer available.
        </p>
        <Link
          href="/projects"
          className="mt-6 inline-flex rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Return to workspace
        </Link>
      </div>
    </main>
  );
}
